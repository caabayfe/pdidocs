/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const { value: addFilterChecked } = { ...api.state.breakdownForm.fields.hasFilter };
    
    return addFilterChecked ? false : true;
}
