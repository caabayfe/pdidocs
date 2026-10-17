/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        reorderPayload,
        conflictObj
    } = api.state;
    let dependencyText = '',
        dependentText = '',
        hasMultiple = false;

    if (conflictObj.dependenciesObj.length) {
        dependencyText = conflictObj.dependenciesObj.toString();
        hasMultiple = conflictObj.dependenciesObj.length > 1;
    }

    if (conflictObj.dependents.length) {
        dependentText = conflictObj.dependents.toString();
        hasMultiple = conflictObj.dependents.length > 1;
    }

    if (dependencyText && conflictObj.isTaskReorder)
        return helpers.translateSync("If you go ahead with this reordering the dependency on ") + `${conflictObj.hasCategoryDependency ? helpers.translateSync("category(s) "): helpers.translateSync("task(s) ")}` + dependencyText + helpers.translateSync(" will be deleted.");
    else if (dependentText && conflictObj.isTaskReorder)
        return helpers.translateSync("If you go ahead with this reordering the dependency of the ") + `${conflictObj.hasCategoryDependency ? helpers.translateSync("category(s) "): helpers.translateSync("task(s) ")}` + dependentText + helpers.translateSync(" will be deleted.");
    else if (dependencyText) {
        let catText = dependencyText;
        catText += hasMultiple ? helpers.translateSync(" and tasks within them") : helpers.translateSync(" and tasks within it");
        return helpers.translateSync("If you go ahead with this reordering the dependency on category(s) ") + catText + helpers.translateSync(" will be deleted.");
    } else if (dependentText) {
        return helpers.translateSync("If you go ahead with this reordering the dependency of the category(s) ") + dependentText + helpers.translateSync(" and tasks within it will be deleted.");
    }
}
