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
        VIEWS
    } = api.state;
    const excludeList = [
        VIEWS.LANDING_PAGE,
        VIEWS.ENTITY_FORM,
        VIEWS.ACTIVITY_FORM,
        VIEWS.BREAKDOWNS_LIST,
        VIEWS.BREAKDOWN_FORM,
        VIEWS.ADVANCED_CONDITION,
        VIEWS.METRICS,
    ];
    return excludeList.includes(currentView);
}
