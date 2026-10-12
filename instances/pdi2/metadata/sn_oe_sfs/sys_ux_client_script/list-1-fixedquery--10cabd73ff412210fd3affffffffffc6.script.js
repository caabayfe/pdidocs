/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.context.props.table == 'sys_cs_context_profile' ? 'model_type=nlu_keyword^ORmodel_type=' : api.context.props.fixedFilter;
}
