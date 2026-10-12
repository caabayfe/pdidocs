/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var dataObj = {};
    var index = 0;

    if (api.data.look_up_simulation_runs.results.length === 0) {
        api.setState('showNoData', true);
        return;
    }

    // When simulation is still running, ignore latest run for data
    if (api.data.look_up_simulation_runs.results[0].state.value === "running") {
        index = 1;
    }

    var rateChange = 0;
    var timeStamp = '';
    var dataVisual = api.state.dataVisual;

    if (api.data.look_up_simulation_runs.results.length === 1 || (api.data.look_up_simulation_runs.results.length === 2 && index === 1)) {
        api.setState('singleScore', api.data.look_up_simulation_runs.results[0].resolution_rate.displayValue);
        api.setState('hideSingleScore', false);
    }

    else {
        for (var i = index; i < api.data.look_up_simulation_runs.results.length; i++) {
            if (i === index) {
                dataVisual[0].data[0].value = api.data.look_up_simulation_runs.results[index].resolution_rate.displayValue;
            }
            dataObj = {};
            dataObj['value'] = api.data.look_up_simulation_runs.results[i].resolution_rate.displayValue;
            timeStamp = new Date(api.data.look_up_simulation_runs.results[i].completed_time.value.replaceAll('-','/'));
            dataObj['timestamp'] = String(timeStamp.getTime());
            dataVisual[0].sparkline.data.unshift(dataObj);

        }
        rateChange = api.data.look_up_simulation_runs.results[index].resolution_rate.value - api.data.look_up_simulation_runs.results[index+1].resolution_rate.value;
        if (rateChange === 0) {
            dataVisual[0].metadata.changeArrow = 'steady';
        }
        else if (rateChange > 0) {
            dataVisual[0].metadata.changeArrow = 'up';
        }
        else {
            dataVisual[0].metadata.changeArrow = 'down';
        }
        dataVisual[0].data[0].change = String(rateChange);
        dataVisual[0].data[0].changePercent = String(rateChange);
        timeStamp = new Date(api.data.look_up_simulation_runs.results[index+1].completed_time.value.replaceAll('-','/'));
        dataVisual[0].metadata.previousScoreDate = String(timeStamp.getTime());
        api.setState('showChange', true);
    }
    api.setState('dataVisual', dataVisual);
}
