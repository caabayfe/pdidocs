/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        comparisonRowStaticChoiceInputClicked,
        getAppseeRequestPayload,
        setChoiceEditorLoadingState
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();

    const {
        comparisonId,
        valueFieldLabel: {
            fieldInternalValue
        },
        tableName,
        stepNo
    } = event.payload;

    const {
        steps
    } = api.state;
    const currentStep = steps.find(step => step.stepNo === stepNo);
    const {
        comparisonModel
    } = currentStep;

    const appseeAPIPayload = getAppseeRequestPayload(comparisonId, fieldInternalValue, tableName, comparisonModel);

    api.setState('fetchChoiceValuesPayload', {
        ...appseeAPIPayload,
        comparisonId,
        stepNo
    });
    const updatedComparisonModel = setChoiceEditorLoadingState(comparisonId, comparisonModel);
    const stepsCopy = [...steps];
    stepsCopy[stepNo - 1] = {
        ...currentStep,
        comparisonModel: updatedComparisonModel
    };
    api.setState('steps', stepsCopy);
}
