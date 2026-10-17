/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    let nonReportingDiscoverySources = JSON.parse(JSON.stringify(api.state.nonReportingDiscoverySources));
    var query = JSON.parse(JSON.stringify(api.state.query));
    let newSource = event.payload.value; 
    const duplicate = nonReportingDiscoverySources.find(item => item === newSource);
    if(!duplicate) {
        nonReportingDiscoverySources.push(newSource);
        query.query_json.excluded_discovery_source = nonReportingDiscoverySources.join(',');
        api.setState('query', query);
        api.setState('nonReportingDiscoverySources', nonReportingDiscoverySources);
        api.setState('selectedGapBaseSource', "x" + newSource);
        api.setState('isDirty', true);
        api.emit('CHECK_FORM_STATUS');
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: await helpers.translate('This Discovery Source has already been added'),
                    action: { type: 'dismiss' }
                }
            ]
        }); 
    }
}
