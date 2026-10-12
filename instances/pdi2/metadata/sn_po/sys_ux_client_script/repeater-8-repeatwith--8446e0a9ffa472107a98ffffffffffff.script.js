/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedEntity.filter) {
        // we know the fixed filters encoded-query of playbook projects..
        // ex: Process Definition Source = sys_Id^State = Complete^Archive =^Process Variant is empty^[extra-filteringQuery]
        const conditions = api.state.selectedEntity.filter.displayValue.split('.and.');
        // get the fixed filters encoded query 
        return conditions.slice(0, 4);
    }
    return null;
}
