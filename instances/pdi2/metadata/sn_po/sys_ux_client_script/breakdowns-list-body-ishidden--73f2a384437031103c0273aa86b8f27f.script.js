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
        VIEWS.ACTIVITIES_LIST,
        VIEWS.ACTIVITY_FORM,
        VIEWS.ENTITY_FORM,
        VIEWS.BREAKDOWN_FORM,
        VIEWS.ADVANCED_CONDITION,
        VIEWS.METRICS,
    ];
    return excludeList.includes(currentView);
}
