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
        comparisonRowFilterPropertiesClicked
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();

    const {
        comparisonId,
        tableName,
        customOption,
        fieldInternalValue,
        valueEditorInternalValue,
        stepNo
    } = event.payload;

    const {
        steps,
        dotWalkMetadata,
        fieldOperatorRelationships
    } = api.state;
    const currentStep = steps.find(step => step.stepNo === stepNo);
    const {
        comparisonModel
    } = currentStep;

    if (fieldInternalValue === 'Event Trigger') {
        const fetchChoiceValuesPayload = {
            source: 'filter_properties_clicked',
            event_name: JSON.parse(valueEditorInternalValue)[0],
            comparisonId,
            fieldInternalValue,
            stepNo
        };
        api.setState('fetchChoiceValuesPayload', fetchChoiceValuesPayload);
        return;
    }

    if (tableName === 'topic_sub_categories' || fieldInternalValue === 'Topic') {
        const updatedComparisonModel = comparisonRowFilterPropertiesClicked(event.payload, comparisonModel, 'va_funnel', dotWalkMetadata, fieldOperatorRelationships);
        const stepsCopy = [...steps];
        const updatedStep = {
            ...currentStep
        };
        updatedStep.comparisonModel = updatedComparisonModel;
        stepsCopy[stepNo - 1] = updatedStep;
        api.setState('steps', stepsCopy);
    }
}
