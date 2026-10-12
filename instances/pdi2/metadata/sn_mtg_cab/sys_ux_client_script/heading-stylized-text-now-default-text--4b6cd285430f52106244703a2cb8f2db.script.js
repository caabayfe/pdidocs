/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.context.props.approvalsData?.requiresUserApproval)
        return;
    const approvalsRequired = api.context.props.approvalsData.requiresUserApproval;

    if (approvalsRequired) {
        const groups = api.context.props.approvalsData.groups;
        if (groups.length === 0)
            return helpers.translateSync("Your approval has been requested.");
        else if (groups.length === 1)
            return helpers.translateSync("Your approval has been requested as a representative of the {0} group.", groups[0].display_value);
        else
            return helpers.translateSync("Your approval has been requested.");
    }
}
