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
    if (!dependencies || !dependencies.result || dependencies.result.dependencies.length == 0) return;
    let {
        dependency
    } = api.data.get_dependencies_1.output.result.dependencies[0];
    if (dependency.length > 0) {
        let dependencyText;
        if (dependency.length == 1) {
            dependencyText = dependency[0].name;
        } else if (dependency.length == 2) {
            dependencyText = dependency[0].name + ' and ' + dependency[1].name;
        } else {
            dependencyText = dependency[0].name + ', ' + dependency[1].name + ' and ' + String(dependency.length - 2) + ' more';
        }
        if (dependency[0].type == 'activity') {
            if (dependency.length > 1)
                return 'Unlocks after tasks ' + dependencyText;
            else
                return 'Unlocks after task ' + dependencyText;

        } else {
            if (dependency.length > 1)
                return 'Unlocks after categories ' + dependencyText;
            else
                return 'Unlocks after category ' + dependencyText;
        }
    }
}
