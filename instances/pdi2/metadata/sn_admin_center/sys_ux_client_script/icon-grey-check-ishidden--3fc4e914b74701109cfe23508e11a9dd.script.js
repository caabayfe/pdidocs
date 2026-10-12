/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // To Do: Use check icons with explanation
    // const isHidden = api.item.value.dependency_status === api.state.installedDependencyStatus;
    const isHidden = true;

    return isHidden;
}
