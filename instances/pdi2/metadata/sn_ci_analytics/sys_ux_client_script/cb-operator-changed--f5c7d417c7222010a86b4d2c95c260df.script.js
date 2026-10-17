/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { 
        comparisonRowOperatorChanged
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {comparisonModel} = api.state;
    const updatedComparisonModel = comparisonRowOperatorChanged(event.payload, comparisonModel);
    api.setState('comparisonModel', updatedComparisonModel);
    api.setState('selectedFilterId', '');
}
