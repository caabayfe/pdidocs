/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
 
    let attributes = JSON.parse(JSON.stringify(api.state.attributesToCompare));
    var newAttribute = String(api.state.selectedAttribute); // Convert to string to avoid referece
    const duplicate = attributes.find(item => item === newAttribute);
    if(!duplicate) {
        attributes.push(newAttribute);
        api.setState('attributesToCompare', attributes);
        api.setState('selectedAttribute', null);
        api.setState('isDirty', true);
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: await helpers.translate('This attribute has already been added'),
                    action: { type: 'dismiss' }
                }
            ]
        }); 
    }
}
