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
        getNewComparisonModel
    } = imports['sn_ci_analytics.VAFunnelUtils']();

    const comparisonModel = getNewComparisonModel();
    const newStep = {
        stepNo: api.state.steps.length + 1,
        comparisonModel: comparisonModel,
    };

    const updatedSteps = [...api.state.steps, newStep];
    api.setState('steps', updatedSteps);
}
