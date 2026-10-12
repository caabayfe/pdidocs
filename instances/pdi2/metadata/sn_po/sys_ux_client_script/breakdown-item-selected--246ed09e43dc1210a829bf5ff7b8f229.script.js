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
    let classificationFields = [...api.state.classificationFields];
    const ids = event.payload.item.map(field => field.id);
    classificationFields = classificationFields.map((item) => {
            if (ids.join('.') == item.id) {
                return {
                    ...item,
                    selected: event.payload.selected
                };
            }
            return item;
        });
    api.setState('classificationFields', classificationFields);
   
}
