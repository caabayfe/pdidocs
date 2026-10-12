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
    if (isPlaybookSourceTypeProject) {
        return false;
    }
    const excludeList = [
        VIEWS.ACTIVITIES_LIST,
        VIEWS.ACTIVITY_FORM,
        VIEWS.BREAKDOWNS_LIST,
        VIEWS.BREAKDOWN_FORM,
        VIEWS.ADVANCED_CONDITION,
        VIEWS.METRICS
    ];
    return excludeList.includes(currentView);
}
