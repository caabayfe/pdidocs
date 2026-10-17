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
        getUpdatedComparisonModel,
        deleteStep
    } = imports['sn_ci_analytics.VAFunnelUtils'](api);
    
    const {
        stepNo,
        comparisonIds = []
    } = event.payload;
    const {
        steps
    } = api.state;
    const currentStep = steps.find(step => step.stepNo === stepNo);
    const {
        comparisonModel
    } = currentStep;

    if (steps.length > 1 &&
        comparisonModel.length === 1 &&
        comparisonModel[0].comparisonType === 'NEW_QUERY' &&
        !comparisonModel[0].field.display &&
        !comparisonModel[0].field.internal) {

        const stepsCopy = [...steps];

        const removeStepIndex = stepNo - 1;
        stepsCopy.splice(removeStepIndex, 1);
        const updateSteps = stepsCopy.map((step, index) => {
            return {
                ...step,
                stepNo: index + 1
            };
        });
        api.setState("steps", updateSteps);

        return;
    }

    const updatedComparisonModel = getUpdatedComparisonModel('ROW_DELETED', event.payload, comparisonModel);
    const stepsCopy = [...steps];
    const updatedStep = {
        ...currentStep
    };
    updatedStep.comparisonModel = updatedComparisonModel;
    stepsCopy[stepNo - 1] = updatedStep;
    api.setState('steps', stepsCopy);
}
