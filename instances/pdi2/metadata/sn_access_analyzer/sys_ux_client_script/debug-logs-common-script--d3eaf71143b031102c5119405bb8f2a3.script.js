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

    var tableDef = api.state.tableDef;
    const { showServerError, navigate, EvalStatus, navTo } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController("tableDef");

    // ------------------------------------------------------------//

    function onPageReady() {
        EvalStatus.translate();
        var messages = api.state.tableDef.messages;

        helpers.translate("#") //
            .then(label => api.state.translatedMessages.index = label);
        helpers.translate("Name") //
            .then(label => api.state.translatedMessages.name = label);
        helpers.translate("Decision type") //
            .then(label => api.state.translatedMessages.decisionType = label);
        helpers.translate("Applies to condition") //
            .then(label => api.state.translatedMessages.appliesToCondition = label); 
        helpers.translate("Empty") //
            .then(label => api.state.translatedMessages.empty = label);          
        helpers.translate("ACL Applies to") //
            .then(label => api.state.translatedMessages.appliesTo = label);

        helpers.translate("We're sorry. We couldn't find any access difference between the users to this operation.") //
            .then(label => messages.noDifference.heading = label);

        helpers.translate("It looks like both the users have the same access to the operation.") //
            .then(label => messages.noDifference.content = label);

        //accordian items heading translation
        helpers.translate("How to read the results on the operation page?") //
            .then(label => api.state.translatedMessages.accordionItem1 = label);
        helpers.translate("What are the different evaluation states?") //
            .then(label => api.state.translatedMessages.accordionItem2 = label);
        helpers.translate("What is Show differences only?") //
            .then(label => api.state.translatedMessages.accordionItem3 = label);

    }

    // ------------------------------------------------------------//

    function paginate() {
        pListCtrl.handlePagination(event);
    }

    // ------------------------------------------------------------//

    function pageNavigation() {
        var value = event.payload.cell.metadata;
        if (value.type == 'Access Handler') {
            helpers.modal.open('accessHandlerModal', {
                bare: true
            });
            return;
        }

        if (value.type == 'Business Rule') {
            navigate({
                external: navTo('sys_script', value.id)
            });
            return;
        }

        if (value.type == 'Data Filtration') {
            navigate({
                external: navTo('sys_df_data_filtration', value.id)
            });
            return;
        }

        navigate({
            route: 'compare-user-acl-details',
            fields: {
                baseUserResultId: api.state.pageParams.baseUserResultId,
                modelUserResultId: api.state.pageParams.modelUserResultId,
                baseUserDebugLogId: value.baseUser ? value.baseUser.sysId : 0,
                modelUserDebugLogId: value.modelUser ? value.modelUser.sysId : 0
            }
        });
    }

    function closeAccessHandlerModal() {
        helpers.modal.close("accessHandlerModal");
    }

    // ------------------------------------------------------------//

    // Based on elementId or eventName above methods will be called

    ({
        paginate: paginate,
        debugLogTable: pageNavigation,
        accessResult: showServerError,
        debugLog: showServerError,
        closeAccessHandlerModal: closeAccessHandlerModal,
        macroponent_ready: onPageReady
    } [event.elementId || event.name.toLowerCase()])();
}
