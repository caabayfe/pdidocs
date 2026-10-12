/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let dependencies = api.data.get_dependencies_1.output;
    if (!dependencies || !dependencies.result) return false;
    dependencies = dependencies.result.dependencies;
    return dependencies.length != 0 && dependencies[0].dependency.length != 0;
}
