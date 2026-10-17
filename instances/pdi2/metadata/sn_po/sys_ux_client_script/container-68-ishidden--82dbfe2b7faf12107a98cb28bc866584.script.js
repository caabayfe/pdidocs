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
        VIEWS.ADVANCED_CONDITION,
        VIEWS.ACTIVITIES_LIST,
        VIEWS.ACTIVITY_FORM,
        VIEWS.ENTITY_FORM,
        VIEWS.LANDING_PAGE,
        VIEWS.BREAKDOWNS_LIST,
        VIEWS.BREAKDOWN_FORM
    ];

    return excludeList.includes(currentView);
}
