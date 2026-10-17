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
    const {comparisonId} = event.payload;
    const {comparisonModel} = api.state;
    const updatedComparisonModel = comparisonRowOrClicked(comparisonId, comparisonModel);
    api.setState('comparisonModel', updatedComparisonModel);
    api.setState('selectedFilterId', '');
}
