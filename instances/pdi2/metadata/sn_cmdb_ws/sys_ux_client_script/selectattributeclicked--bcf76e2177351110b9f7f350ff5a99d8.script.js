/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   let attributes = JSON.parse(JSON.stringify(api.state.attributesToCompare));
    var newAttribute = event.payload.value;
    const duplicate = attributes.find(item => item === newAttribute);
    if(!duplicate) {
        attributes.push(newAttribute);
        api.setState('attributesToCompare', attributes);
        api.setState('selectedAttribute', "x" + newAttribute);
        api.setState('isDirty', true);
        api.emit('CHECK_FORM_STATUS');
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: 'This attribute has already been added',
                    action: { type: 'dismiss' }
                }
            ]
        }); 
    }
}
