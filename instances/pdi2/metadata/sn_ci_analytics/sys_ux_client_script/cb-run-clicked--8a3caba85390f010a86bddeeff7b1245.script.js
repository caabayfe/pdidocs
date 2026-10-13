/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const isConditionBuilderEmpty = (comparisonModel) => {
        return comparisonModel && comparisonModel.length === 1 && !comparisonModel[0].field.internal;
    };

    const {
        validateConditionBuilderInputs
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {comparisonModel, selectedFilterId} = api.state;
    const comparisonModelCopy = JSON.parse(JSON.stringify(comparisonModel));
    /**
     * Conditions should run when:
     * 1. all the inputs are valid
     * 2. if the condition builder is empty and user is trying to reset
     */
    if (isConditionBuilderEmpty(comparisonModel) || validateConditionBuilderInputs(comparisonModelCopy)) {
        api.emit('VA_CONDITION_BUILDER#CONDITION_BUILDER_RUN_CLICKED', {
            comparisonModel,
            loadedFilterId: selectedFilterId
        });
    } else {
        api.setState('comparisonModel', comparisonModelCopy);
    }
}
