
class Auditor {

    static generateUID () {
        let hrtime = process.hrtime();
        return ((hrtime[0]) * 1e9) + (hrtime[1]) ;
    }

    constructor ({entryPoint, uid}) {
        this._uid = uid || Auditor.generateUID();
        this._storage = {
            entryPoint: entryPoint,
            uid : this._uid
        };
    }

    get uid () {
        return this._uid;
    }

    audit (type, data) {
        if(!this._storage[type]) {
            this._storage[type] = [];
        }
        this._storage[type].push(data);
    }

    getReport () {
        return {
            raw : this._storage,
            //in an object for future compat
        }
    }

}


module.exports = Auditor;