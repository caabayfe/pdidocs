/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    let newClass = String(api.state.selectedClass); // Convert to string to avoid referece
    const duplicate = query.query_json.class_conditions.find(item => item.class_name === newClass);
    if(!duplicate) {
        query.query_json.class_conditions.unshift({
            'class_name' : newClass, 
            'condition' : '',
            'allClasses' : false
        });
        api.setState('query', query);
        api.setState('selectedClass', null);
        api.setState('isDirty', true);

    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: 'This class has alreay been added',
                    action: { type: 'dismiss' }
                }
            ]
        }); 
    }
}
