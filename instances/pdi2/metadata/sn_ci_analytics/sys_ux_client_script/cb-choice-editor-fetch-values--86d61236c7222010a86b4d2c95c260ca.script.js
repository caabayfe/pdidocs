/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { 
        comparisonRowStaticChoiceInputClicked,
        getAppseeRequestPayload,
        setChoiceEditorLoadingState
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {comparisonModel} = api.state;
    const {
        comparisonId,
        valueFieldLabel: {
            fieldInternalValue
        },
        tableName
    } = event.payload;
    const appseeAPIPayload = getAppseeRequestPayload(comparisonId, fieldInternalValue, tableName, comparisonModel);
    
    // For cases where choice list is static.
    if (!appseeAPIPayload) {
        const updatedComparisonModel = comparisonRowStaticChoiceInputClicked(event.payload, comparisonModel);
        api.setState('comparisonModel', updatedComparisonModel);
        return;
    }

    const updatedComparisonModel = setChoiceEditorLoadingState(comparisonId, comparisonModel);
    api.setState('comparisonModel', updatedComparisonModel);
    api.setState('fetchChoiceValuesPayload', {
        ...appseeAPIPayload,
        comparisonId
    });
}
