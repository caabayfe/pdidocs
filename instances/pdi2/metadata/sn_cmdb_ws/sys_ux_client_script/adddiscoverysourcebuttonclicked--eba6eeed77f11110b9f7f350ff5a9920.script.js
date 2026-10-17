/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    let newSource = String(api.state.selectedDiscoverySource); // Convert to string to avoid referece
    const duplicate = query.query_json.discovery_sources.find(item => item === newSource);
    if(!duplicate) {
        query.query_json.discovery_sources.push(newSource);
        api.setState('query', query);
        api.setState('selectedDiscoverySource', null);
        api.setState('isDirty', true);
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: 'This Discovery Source has alreay been added',
                    action: { type: 'dismiss' }
                }
            ]
        }); 
    }
}
