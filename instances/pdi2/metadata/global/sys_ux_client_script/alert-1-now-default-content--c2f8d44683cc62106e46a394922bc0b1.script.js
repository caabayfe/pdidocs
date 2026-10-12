/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var currentScope = api.data.get_current_and_available_scopes_1.scopeData.scope.name;
    var tableScope = api.data.record_3.form.fields.sys_scope.displayValue;
    return `This record is in ${tableScope} scope, but currently you are in ${currentScope}. Switch to ${tableScope} scope to edit this record.`;
}
