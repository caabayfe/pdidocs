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
        hasMultiple = conflictObj.dependenciesObj.length > 1;
    }

    if (dependencyText && conflictObj.isTaskReorder)
        return `<div style="font-size:16px;line-height:20px">${helpers.translateSync('Task ')}<b>${conflictObj.stepName}</b> ${helpers.translateSync('is unlocked on completion of ')} ${conflictObj.hasCategoryDependency ? helpers.translateSync('category(s) ') : helpers.translateSync('Task(s) ')} <b>${dependencyText}</b> ${helpers.translateSync("and can't be placed ahead of the unlocking ")} ${conflictObj.hasCategoryDependency ? helpers.translateSync('category') : helpers.translateSync('Task')}</div>`;
    else if (dependentText && conflictObj.isTaskReorder)
        return `<div style="font-size:16px;line-height:20px">${helpers.translateSync('Completion of task ')} <b>${conflictObj.stepName}</b> ${helpers.translateSync(' unlocks task(s) ')} <b>${dependentText}</b> ${helpers.translateSync("and can't be placed after the dependent task(s).")}</div>`;
    else if (dependencyText) {
        let catText = dependencyText;
        catText += hasMultiple ? helpers.translateSync(' and tasks within them') : helpers.translateSync(' and tasks within it');
        return `<div style="font-size:16px;line-height:20px">${helpers.translateSync('Tasks within category ')} <b>${conflictObj.stepName}</b> ${helpers.translateSync(' are unlocked on completion of category(s) ')} <b>${catText}</b>${helpers.translateSync(" and can't be placed ahead of the unlocking category(s).")}</div>`;
    } else if (dependentText)
        return `<div style="font-size:16px;line-height:20px">${helpers.translateSync('Completion of category ')}<b>${conflictObj.stepName} ${helpers.translateSync(' and tasks within it')}</b> ${helpers.translateSync(' unlocks tasks within category(s) ')} <b>${dependentText}</b> ${helpers.translateSync(" and can't be placed after the dependent category.")}</div>`;

}
