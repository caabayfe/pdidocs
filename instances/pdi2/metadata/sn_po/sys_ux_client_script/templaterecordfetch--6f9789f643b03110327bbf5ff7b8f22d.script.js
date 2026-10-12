/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    
    if (api.data.look_up_template_record.results[0].table.value != api.state.selectedSourceValue) {
        api.setState('projectDetails', { ...api.state.projectDetails,
            source: ''
        });
         api.setState('selectedSourceLabel', '');
         api.setState('selectedSourceValue', '');
    }
}
