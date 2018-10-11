let dataBySession = {};

let chartConfig = {

    chart :{
        height : 693
    },
    title: {
        text: ''
    },

    yAxis : [{}],

    series: [{
        keys: ['from', 'to', 'weight'],
        clip : false,
        shadow : true,
        data: [],

        dataLabels: {
            nodeFormat: '{point.name}',
        },
        nodes: [{
            id: '',
            name: ''
        }],
        type: 'sankey',
        name: ''
    }]

};

let chart = Highcharts.chart('true_calls_display', chartConfig);

new EventSource('/api/v1/data').onmessage = function (event) {
    let data = {};

    if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
    }

    if (Array.isArray(data)) {
        data.forEach(function (session) {
            addSession(session);
        });
    }
    else {
        addSession(data);
    }

    reDraw();
};

function addSession(session) {
    if (typeof session === 'string') {
        session = JSON.parse(session);
    }

    console.log('session', session);

    if (!dataBySession[session.entryPoint]) {
        dataBySession[session.entryPoint] = {};
    }
    if (!dataBySession[session.entryPoint][session.uid]) {
        dataBySession[session.entryPoint][session.uid] = {};
    }
    dataBySession[session.entryPoint][session.uid] = session;
}

function reDraw() {
    let sessionList = document.getElementById('tree');

    let lastCall = null;
    Object.keys(dataBySession).forEach((funcName) => {
        let detail = document.createElement('details');
        detail.open = true;
        const summary = document.createElement('summary');
        let funcNameLabel = document.createElement('label');
        funcNameLabel.innerText = funcName;
        summary.appendChild(funcNameLabel);
        detail.appendChild(summary);


        Object.keys(dataBySession[funcName]).forEach((sessionId) => {

            let div = document.createElement('a');
            div.href = 'javascript: void(0)';
            div.style = 'padding-left:10px';

            let innerDetail = document.createElement('ul');
            const innerSummary = document.createElement('li');

            let sessionLabel = document.createElement('label');
            sessionLabel.onclick = loadSession(funcName, sessionId);

            sessionLabel.innerText = sessionId;
            innerSummary.appendChild(sessionLabel);
            innerDetail.appendChild(innerSummary);


            div.appendChild(innerDetail);
            detail.appendChild(div);

            lastCall = {
                funcName: funcName,
                sessionId: sessionId
            }

        });

        sessionList.appendChild(detail);

    });

    if(lastCall) {
        loadSession(lastCall.funcName, lastCall.sessionId)();
    }

}

function loadSession(fName, sessionId) {
    return function () {
        console.log('loading', fName, sessionId);

        document.getElementById('funcName').innerText = fName + ' ' + sessionId;

        const sessData = dataBySession[fName][sessionId];
        loadHttp(sessData.http || []);
        loadDependencyTree(sessData.dependencies || {});
        loadTraces(sessData.traces || []);
        loadLogs(sessData.logs || []);
        loadMeters(sessData.meters || []);
        loadTrueCalls(sessData.true_calls || []);
    };
}


function loadHttp(data) {
    let http = document.getElementById('http');
    http.innerHTML = '';
    http.appendChild(table(data.map(function (harLine) {
        return [
            createHref(harLine.request.url, loadDisplay(harLine)),
            harLine.response.content.text
        ];
    })));
}

function loadDisplay (thing) {
    return function () {
        let display = document.getElementById('display');

        display.innerHTML = JSON.stringify(thing, null, 3);
    };
}

function createHref (text, func) {
    let clickAbleTimestamp = document.createElement('a');
    clickAbleTimestamp.href = 'javascript:void(0)';
    clickAbleTimestamp.onclick = func;
    clickAbleTimestamp.innerText = text;
    return clickAbleTimestamp
}

function loadTraces(data) {
    let traces = document.getElementById('trace');
    traces.innerHTML = '';
    const formedTraces = data.map(function (trace) {
        return [
            createHref(trace.timestamp, loadDisplay(trace)),
            trace.line,
            trace.meter
        ];
    });
    console.log('traces', formedTraces);
    traces.appendChild(table(formedTraces));
}

function loadMeters (data) {
    let meters = document.getElementById('meters');
    meters.innerHTML = '';
    const formedMeters = data.map(function (meter) {
        return [
            createHref(meter.name, loadDisplay(meter)),
            // meter.name,
            meter.time
        ];
    });
    console.log('meters', formedMeters);
    meters.appendChild(table(formedMeters));
}

function loadDependencyTree(data) {
    let dependencies = document.getElementById('dependencies');
    dependencies.style = 'white-space: pre;';
    dependencies.innerHTML = (tree(data));
}

function loadLogs(data) {
    const logs = document.getElementById('logs');
    logs.innerHTML = '';
    logs.appendChild(table(data.map(function (log) {
        return [createHref(log.timestamp, loadDisplay(log)), log.message];
    })));
}



function loadSankey (data) {
    // return function () {
        chartConfig.series[0].data.push(data);
        chartConfig.yAxis[0].isDirty = true;
        chart.update(chartConfig, true, true, true);
    // };
}


function loadTrueCalls(data) {
    data.forEach(loadSankey);
}


function reset () {
    chartConfig.series[0].data = [];
    chartConfig.yAxis[0].isDirty = true;
    chart.update(chartConfig, true, true, true);
}


function table(arrayOfArrays) {
    return arrayOfArrays.reduce(function (acc, v) {

        let tr = v.reduce(function (acc, v) {

            let time = document.createElement('td');
            if(typeof v !== 'object') {
                time.innerText = v;
            }
            else {
                try {
                    time.appendChild(v);
                }
                catch(e){}
            }

            acc.appendChild(time);

            return acc;

        }, document.createElement('tr'));

        acc.appendChild(tr);

        return acc;
    }, document.createElement('table'));
}

function tree(mapOfMapsOfMapsOf) {
    return JSON.stringify(mapOfMapsOfMapsOf, null, 3);
}