/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { 
        comparisonRowFilterPropertiesClicked
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {
        comparisonModel
    } = api.state;
    const {
        comparisonId,
        tableName,
        customOption,
        fieldInternalValue,
        valueEditorInternalValue
    } = event.payload;

    if (fieldInternalValue === 'Events') {
        const fetchChoiceValuesPayload = {
            source: 'filter_properties_clicked',
            event_name: JSON.parse(valueEditorInternalValue)[0],
            comparisonId,
            fieldInternalValue
        };
        api.setState('fetchChoiceValuesPayload', fetchChoiceValuesPayload);
        return;
    }
    
    const {dotWalkMetadata, fieldOperatorRelationships} = api.state;
    const updatedComparisonModel = comparisonRowFilterPropertiesClicked(event.payload, comparisonModel, '', dotWalkMetadata, fieldOperatorRelationships);
    api.setState('comparisonModel', updatedComparisonModel);
    api.setState('selectedFilterId', '');
}
