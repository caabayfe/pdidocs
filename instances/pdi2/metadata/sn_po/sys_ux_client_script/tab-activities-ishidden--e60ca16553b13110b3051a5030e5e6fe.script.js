/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        view: currentView
    } = api.state.currentView;
    const {
        VIEWS,
        isPlaybookSourceTypeProject
    } = api.state;
    const excludeList = [
        VIEWS.ADVANCED_CONDITION,
        VIEWS.BREAKDOWNS_LIST,
        VIEWS.BREAKDOWN_FORM,
        VIEWS.ENTITY_FORM,
        VIEWS.LANDING_PAGE,
        VIEWS.METRICS
    ];
    return excludeList.includes(currentView) || isPlaybookSourceTypeProject;
}
