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

    const { navigate, showServerError, EvalStatus } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController("tableDef");

    // -------------------------------------------------------------------------------- //

    function showDifference() {
        (event.payload.value == true) ? pListCtrl.showDifference() : pListCtrl.reset();
    }
    const closeNoAclModal = () => helpers.modal.close("noAclModal");
    
    const onPageReady = () => {
        EvalStatus.translate();

        var messages = api.state.tableDef.messages;
        helpers.translate("Operation") //
            .then(label => api.state.translatedMessages.operation = label);
        helpers.translate("We're sorry. We couldn't find any access difference between the users.") //
            .then(label => messages.noDifference.heading = label);
        helpers.translate("It looks like both the users have the same access.") //
            .then(label => messages.noDifference.content = label);
            
        helpers.translate("Sorry, we couldn't find any Access control rules!") //
            .then(label => api.setState("noAclHeader", label));
        
        helpers.translate("It could be because there are no rules defined for this operation") //
            .then(label => {
                api.setState("noAclEmptyStateHeader", {
                    label: label,
                    level: 3
                });
                });
//accordian items heading translation
        helpers.translate("How to read the results on the access control comparison page?") //
            .then(label => api.state.translatedMessages.accordionItem1 = label);
        helpers.translate("What are the different evaluation states?") //
            .then(label => api.state.translatedMessages.accordionItem2 = label);
        helpers.translate("What is Show differences only?") //
            .then(label => api.state.translatedMessages.accordionItem3 = label);
    };
    // -------------------------------------------------------------------------------- //

    function pageNavigation() {
        const baseUser = event.payload.cell.metadata.baseUser || {};
        const modelUser = event.payload.cell.metadata.modelUser || {};
        api.state.props.baseUserResultId = baseUser.resultId;
        api.state.props.modelUserResultId = modelUser.resultId;
        api.state.commonDataSource.tableName = "sn_access_analyzer_debug_log";
        api.state.commonDataSource.fields = "sys_id";
        api.state.commonDataSource.condition = `access_result=${baseUser.resultId}^ORaccess_result=${modelUser.resultId}`;
        api.state.commonDataSource.maxResults = 1;
        api.data.commonDataSource.refresh();
    }

    // -------------------------------------------------------------------------------- //

    function onDebugLogSuccess(results) {
        if (results.length == 0) {
            helpers.modal.open("noAclModal", {
                bare: true
            });
            return;
        }
        navigate({
            route: "compare-user-debug-logs",
            fields: {
                baseUserResultId: api.state.props.baseUserResultId,
                modelUserResultId: api.state.props.modelUserResultId
            }
        });
    }

    // -------------------------------------------------------------------------------- //


    function commonDataSourceOnSuccess() {
        var glideQuery = api.data.commonDataSource.output.data.GlideRecord_Query;
        if (glideQuery.sys_user_has_role_time_limited != undefined) {
            timeLimitedRoleAlert(glideQuery["sys_user_has_role_time_limited"]._results);
        } else  if(glideQuery.sn_access_analyzer_debug_log != undefined ) {
            onDebugLogSuccess(glideQuery["sn_access_analyzer_debug_log"]._results);
        }
    }

    // -------------------------------------------------------------------------------- //

    function timeLimitedRoleAlert(results) {
        if (results.length == 0) {
            return;
        }

        var url = "nav_to.do?uri=sys_user_has_role_time_limited_list.do?sysparm_query=";
        url += encodeURIComponent("user=" + api.state.props.requestInfo.baseUser.id);
        url += "^OR" + encodeURIComponent("user=" + api.state.props.requestInfo.modelUser.id);

        helpers.translate("Time limited role assignments found for the user due to which the results may be impacted. You can review the time limited roles assigned for the user")
            .then(function(content) {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "time_limited_role_alert",
                        status: "high",
                        icon: "diamond-exclamation-outline",
                        content: content,
                        action: {
                            type: "dismiss"
                        },
                        textLinkProps: {
                            label: "here",
                            href: url
                        }
                    }]
                });
            });
    }

    // -------------------------------------------------------------------------------- //

    // Based on elementId or eventName above methods will be called
    ({
        commonDataSource: commonDataSourceOnSuccess,
        showDifference: showDifference,
        operationList: pageNavigation,
        accessAnalyzerRequest: showServerError,
        accessResult: showServerError,
        closeNoAclModalBtn: closeNoAclModal,
        macroponent_ready: onPageReady,
        commonDataSource: commonDataSourceOnSuccess
    } [event.elementId || event.name.toLowerCase()])();
}
