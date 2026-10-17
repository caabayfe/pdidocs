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
    let query = JSON.parse(JSON.stringify(api.state.query));
    let newClass = String(event.payload.value); // Convert to string to avoid referece
    let allClasses = false;

    if (query.query_json.class_conditions.length === 1 && query.query_json.class_conditions[0].allClasses) {
        query.query_json.class_conditions = [];
    }

    if (newClass === 'all') {
        query.query_json.class_conditions = [];
        allClasses = true;
    }
    const duplicate = query.query_json.class_conditions.find(item => item.class_name === newClass);
    if (!duplicate) {
        query.query_json.class_conditions.unshift({
            'class_name': newClass,
            'condition': '',
            'allClasses': allClasses
        });
        api.setState('query', query);
        api.setState('selectedClass', "x" + newClass);
        api.setState('isDirty', true);
        api.setState('singleClassSelected', newClass);
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'alert1',
                status: 'critical',
                icon: 'info-circle-outline',
                content: 'This class has alreay been added',
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    api.emit('CHECK_FORM_STATUS');
}
