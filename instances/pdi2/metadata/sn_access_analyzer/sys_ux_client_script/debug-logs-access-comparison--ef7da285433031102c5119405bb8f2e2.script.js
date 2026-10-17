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

    const props = api.state.props;
    const { setHeader, EvalStatus } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController("tableDef");

    ({
        debugLog: populateData,
        accessResult: accessResultOnSuccess,
        showDifference: showDifference
    } [event.elementId])();


    // -------------------------------------------------------------------------------- //
    function accessResultOnSuccess() {
        if (api.data.accessResult.results.length == 2) {
            let reqInfo = setHeader({
                result: api.data.accessResult.results,
                screenIndex: 2
            });
            pListCtrl.updateHeader({
                index: api.state.translatedMessages.index,
                name: api.state.translatedMessages.name,
                decisionType: api.state.translatedMessages.decisionType,
                appliesToCondition: api.state.translatedMessages.appliesToCondition,
                empty: api.state.translatedMessages.empty,
                appliesTo: api.state.translatedMessages.appliesTo,
                baseUser: reqInfo.baseUser.name,
                modelUser: reqInfo.modelUser.name
            });
        }
    }
    // -------------------------------------------------------------------------------- //

    function showDifference() {
        event.payload.value == true ? pListCtrl.showDifference() : pListCtrl.reset();
    }

    // -------------------------------------------------------------------------------- //

    function populateData(showDiff = false) {
        var comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers).getComparator("debuglog", api.context.props.baseUserResultId, api.context.props.modelUserResultId);
        var result = comparator.getComparisonResult(api.data.debugLog.results);
        pListCtrl.update(result);
        props.pageReady = result.length > 0;
    }
}
