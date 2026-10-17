/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { 
        comparisonRowFieldMetaRequested
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {dotWalkMetadata, comparisonModel} = api.state;
    const {tables} = event.payload;
    const tableName = tables[tables.length - 1];

    if (dotWalkMetadata[tableName]) return;

    const fetchChoiceValuesPayload = comparisonRowFieldMetaRequested(event.payload, comparisonModel);
    api.setState('fetchChoiceValuesPayload', fetchChoiceValuesPayload);
}
