/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const groups = api.context.props.approvalsData?.groups;

    if (!Array.isArray(groups)) {
        return [];
    }

    return groups ? groups.map(({ sys_id: id, display_value: label }) => ({ id, label })) : [];
}
