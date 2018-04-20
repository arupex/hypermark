
const deepGet = require('deep-value');
const deepSet = require('deep-setter');
const UUID = require('./UUID');

class Tracer {

    /**
     * configuration - Each key in configuration is the key which will be put in request/response
     * {
     *      'x-request-id' : {
     *          in       : [], //will try by order of precedence
     *          request  : [''],
     *          response : [''],
     *          generateOnAbsence : 'uuid' || function || false || undefined
     *      }
     * }
     * @param configuration
     */
    constructor (configuration) {
        if(configuration && typeof configuration === 'object') {
            configuration = {};
        }
        this.__traces = Object.keys(configuration);//kind of expensive so 'cache' it?
        if(this.__traces.length === 0){
            throw new Error('no traces');
        }
        const badTrace = this.__traces.find(e => !configuration[e].in);
        if(badTrace) {
            throw new Error(`Missing "in" value on a trace ${badTrace}`);
        }
        this.__config = configuration;
    }

    /**
     *
     * @param context - In aws lambda terms this might be the event, in a express app this might be req
     * @returns {Trace}
     */
    startTrace (context) {
        return new Trace(this.__traces.reduce((acc, trace) => {
            let value = null;
            const cTrace = this.__config[trace];
            cTrace.in.some(e => {
                return value = deepGet(context, e);
            });
            if(typeof value === 'undefined' && cTrace.generateOnAbsence) {
                if(typeof cTrace.generateOnAbsence === 'function') {
                    value = cTrace.generateOnAbsence(context);
                }
                else if(cTrace.generateOnAbsence === 'uuid') {
                    value = UUID();
                }
            }
            acc.push({
                value : value,
                request : Array.isArray(cTrace.request)?cTrace.request:typeof cTrace.request === 'string'?[cTrace.request]:null,
                response : Array.isArray(cTrace.response)?cTrace.response:typeof cTrace.response === 'string'?[cTrace.response]:null
            });
            return acc;
        }, []));
    }

}

class Trace {

    constructor (traces) {
        this.__traces = traces;
    }

    extendRequest (request) {
        return this.__extend(request, 'request');
    }

    extendResponse (response) {
        return this.__extend(response, 'response');
    }

    __extend(thing, prop) {
        this.__traces.forEach(trace => {
            if(Array.isArray(trace[prop])) {
                trace[prop].forEach(locator => {
                    deepSet(thing, locator, trace.value);
                });
            }
        });
        return thing;
    }

}

module.exports = Tracer;