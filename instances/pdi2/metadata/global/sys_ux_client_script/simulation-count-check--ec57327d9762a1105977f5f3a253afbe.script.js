/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var maxCount = 50000;
    var recordCount = api.data.simulation_record_count.output.data.GlideAggregate_Query[0].count;

    if (api.state.runButtonClicked === true) {
        if (recordCount > maxCount) {
            api.setState('hideAlert', false);
            api.setState('alertType', 'critical');
            api.setState('alertIcon', 'circle-exclamation-outline');
            helpers.translate('Your Record set returned {0} records, but {1} records is the maximum allowed. Change the Record set condition so that it returns {2} records or less.', recordCount, maxCount, maxCount).then((translatedText) => {
                api.setState('alertMessage', translatedText);
            });
            
        }
        else if (recordCount === 0) {
            api.setState('hideAlert', false);
            api.setState('alertType', 'critical');
            api.setState('alertIcon', 'circle-exclamation-outline');
            helpers.translate('Your Record set returned 0 records. Change the Record set condition to return between 1 and {0} records', maxCount).then((translatedText) => {
                api.setState('alertMessage', translatedText);
            });
        }
        //Can successfully run a simulation
        else{
            api.setState('hideAlert', false);
            api.setState('alertType', 'positive');
            api.setState('alertIcon', 'circle-check-outline');
            helpers.translate('A new run of {0} is in progress. View the results below when the run is complete.', api.state.simulationName).then((translatedText) => {
                api.setState('alertMessage', translatedText);
            });
            api.data.dummy_look_up.refresh();
        }
    }
    api.setState('runButtonClicked', false);
}
