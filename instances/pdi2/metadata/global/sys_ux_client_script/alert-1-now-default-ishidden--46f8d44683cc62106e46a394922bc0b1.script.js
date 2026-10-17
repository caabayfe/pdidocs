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
    if (currentScope != tableScope)
        return false;
    else
        return true;

}
