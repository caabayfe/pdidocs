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
        comparisonRowOrClicked
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();

    const {
        stepNo,
        comparisonId
    } = event.payload;
    const {
        steps
    } = api.state;
    const currentStep = steps.find(step => step.stepNo === stepNo);
    const {
        comparisonModel
    } = currentStep;

    const updatedComparisonModel = comparisonRowOrClicked(comparisonId, comparisonModel);
    const stepsCopy = [...steps];
    const updatedStep = {
        ...currentStep
    };
    updatedStep.comparisonModel = updatedComparisonModel;
    stepsCopy[stepNo - 1] = updatedStep;
    api.setState('steps', stepsCopy);
}
