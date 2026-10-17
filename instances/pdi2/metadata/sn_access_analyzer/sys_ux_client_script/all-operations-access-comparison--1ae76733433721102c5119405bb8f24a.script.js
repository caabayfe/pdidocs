/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    const { setHeader } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController("tableDef");
    const props = api.state.props;

    // -------------------------------------------------------------------------------- //

    function accessAnalyzerRequestOnSuccess() {
        if (api.data.accessAnalyzerRequest.results.length == 2) {
            let reqInfo = setHeader({
                request: api.data.accessAnalyzerRequest.results,
                screenIndex: 1
            });

            api.state.commonDataSource.tableName = "sys_user_has_role_time_limited";
            api.state.commonDataSource.fields = "user";
            api.state.commonDataSource.condition = `user=${reqInfo.baseUser.id}^ORuser=${reqInfo.modelUser.id}`;
            api.state.commonDataSource.maxResults = 1;
            api.data.commonDataSource.refresh();

            pListCtrl.updateHeader({
                name: api.state.translatedMessages.operation,
                baseUser: reqInfo.baseUser.name,
                modelUser: reqInfo.modelUser.name
            });
        }
    }

    // -------------------------------------------------------------------------------- //

    function accessResultOnSuccess() {
        var comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers).getComparator("operation", api.context.props.baseUserRequestId, api.context.props.modelUserRequestId);
        var data = comparator.getComparisonResult(api.data.accessResult.results);
        pListCtrl.update(data);
        props.pageReady = data.length > 0;
        return true;
    }

    // -------------------------------------------------------------------------------- //

    // Based on elementId or eventName above methods will be called
    ({ 
        accessAnalyzerRequest : accessAnalyzerRequestOnSuccess,
        accessResult : accessResultOnSuccess
    }[event.elementId])();
}
