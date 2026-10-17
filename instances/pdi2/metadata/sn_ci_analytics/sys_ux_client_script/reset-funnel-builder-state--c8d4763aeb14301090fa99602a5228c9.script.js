/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        name,
        value
    } = event.payload;

    if ((name === 'funnelId' && !value) || name === 'timestamp') {
        resetState();
    }
    api.setState('invalidInput', false);
    api.setState('hideDuplicateNameAlert', true);

    function resetState() {
        const {
            getNewComparisonModel
        } = imports['sn_ci_analytics.VAFunnelUtils']();

        const comparisonModel = getNewComparisonModel();
        const newSteps = [{
            stepNo: 1,
            comparisonModel: comparisonModel,
        }];

        const updatedSteps = newSteps;
        api.setState('steps', updatedSteps);
        api.setState('funnelName', '');
    }
    api.setState('errorMessage', '');

}
