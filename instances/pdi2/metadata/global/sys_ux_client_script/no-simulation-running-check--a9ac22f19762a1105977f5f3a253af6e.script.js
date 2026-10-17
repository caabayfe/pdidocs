/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.no_running_simulation.output.data.GlideAggregate_Query[0].count === 0) {
        api.data.simulation_record_count.refresh();
    }
    else {
        api.setState('hideAlert', false);
        api.setState('alertType', 'critical');
        api.setState('alertIcon', 'circle-exclamation-outline');
        helpers.translate('Another simulation is in progress. Please try again later.').then((translatedText) => {
            api.setState('alertMessage', translatedText);
        });
    }
}
