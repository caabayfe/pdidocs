/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const {
        comparisonRowFieldUpdated
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {comparisonModel, fieldOperatorRelationships} = api.state;
    const updatedComparisonModel = comparisonRowFieldUpdated(event.payload, comparisonModel, fieldOperatorRelationships);
    api.setState('comparisonModel', updatedComparisonModel);
    api.setState('selectedFilterId', '');
}
