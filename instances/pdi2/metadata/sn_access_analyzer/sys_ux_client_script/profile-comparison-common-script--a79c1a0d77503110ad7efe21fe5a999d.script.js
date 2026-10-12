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
    var tabDef = api.state[props.tabName];

    //--------------------------------------------------------------------------------//
    function onPageReady() {
        clearStates();
        helpers.translate("Overview").then(label => api.state.translatedMessages.overview = label);
        helpers.translate("Filter user attributes").then(label => api.state.translatedMessages.userFilterPlaceHolder = label);
        helpers.translate("Filter roles").then(label => api.state.translatedMessages.roleFilterPlaceHolder = label);
        helpers.translate("Filter groups").then(label => api.state.translatedMessages.groupFilterPlaceHolder = label);

        api.setState("aaCommonDBPayload", {
            "action": "getSysUserFields"
        });

        const { EvalStatus } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
        EvalStatus.translate();

        //translations
        helpers.translate("No differences were found").then(label => {
            api.state.group.messages.noDifference.heading = label;
            api.state.role.messages.noDifference.heading = label;
        });
        helpers.translate("Both the users have the same Role assignments").then(label => api.state.role.messages.noDifference.content = label);
        helpers.translate("Both the users have the same Group assignments").then(label => api.state.group.messages.noDifference.content = label);
        helpers.translate("User attributes").then(label => api.state.user.colDef.columns[0].label = label);
        helpers.translate("Role name").then(label => api.state.role.colDef.columns[0].label = label);
        helpers.translate("Group name").then(label => api.state.group.colDef.columns[0].label = label);

        helpers.translate("Show filter panel").then(label => api.state.translatedMessages.showFilterPanel = label);
        helpers.translate("Hide filter panel").then(label => api.state.translatedMessages.hideFilterPanel = label);

        helpers.translate("Role").then(label => api.state.role.messages.tooltip.tabdesc.singular = label);
        helpers.translate("Roles").then(label => api.state.role.messages.tooltip.tabdesc.plural = label);
        helpers.translate("Group").then(label => api.state.group.messages.tooltip.tabdesc.singular = label);
        helpers.translate("Groups").then(label => api.state.group.messages.tooltip.tabdesc.plural = label);
        helpers.translate("User attribute").then(label => api.state.user.messages.tooltip.tabdesc.singular = label);
        helpers.translate("User attributes").then(label => api.state.user.messages.tooltip.tabdesc.plural = label);

        //accordian items heading translation
        helpers.translate("How to read the results on the Details tab?") //
            .then(label => api.state.translatedMessages.accordionItem1 = label);
        helpers.translate("How to grant a role to a user?") //
            .then(label => api.state.translatedMessages.accordionItem2 = label);
        helpers.translate("How to add a user to a group?") //
            .then(label => api.state.translatedMessages.accordionItem3 = label);
        helpers.translate("What is Show differences only?") //
            .then(label => api.state.translatedMessages.accordionItem4 = label);
    };

    //--------------------------------------------------------------------------------//
    
    function clearStates() {
        props.tabIndex = 0;
        props.tabName = "user";
        props.title = "";
    }

    //--------------------------------------------------------------------------------//

    function paginate() {
        const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController(tabDef.name);
        pListCtrl.handlePagination(event);
    }

    //--------------------------------------------------------------------------------//

    function showErrorMessage() {
        const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController(tabDef.name);
        pListCtrl.showServerErrorMessage(tabDef.emptyStateName);
    }

    //--------------------------------------------------------------------------------//

    function onTabChange() {
        if (event.payload.isInitialPageLoad) {
            return;
        }
        props.tabIndex = event.payload.selectedTabIndex;
        var tabArr = ["user", "role", "group"];
        props.tabName = tabArr[props.tabIndex];
        var tabDef = api.state[props.tabName];
        if (tabDef.sourceData == null) {
            api.setState("tableSource", {
                name: tabDef.table.name,
                fields: tabDef.table.fields,
                condition: tabDef.table.condition.replace("{baseUserId}", api.context.props.baseUserId).replace("{modelUserId}", api.context.props.modelUserId),
                orderBy: tabDef.table.orderBy
            });
            return;
        }
        var list;
        if (tabDef.showDifferences) {
            list = tabDef.sourceData.filter(row => row.baseUser != row.modelUser);
        } else {
            list = tabDef.sourceData;
        }
        emitForFilterListUpdate(list, false);
    }


    //--------------------------------------------------------------------------------//

    function showDifferences() {
        tabDef.showDifferences = event.payload.value;
        const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController(tabDef.name);

        var list;
        if (tabDef.showDifferences) {
            pListCtrl.update();
            list = pListCtrl.getFilteredData();
        } else {
            pListCtrl.reset();
            list = pListCtrl.getSourceData();
        }
        emitForFilterListUpdate(list, true);
    }

    //--------------------------------------------------------------------------------//

    function emitForFilterListUpdate(list, selected) {
        api.emit("ACE_ACTION_PERFORMED", {
            id: "FILTER_COMPONENT_PREPARE_LIST",
            list: list,
            selected: selected
        });
    }
    //--------------------------------------------------------------------------------//

    function navigateToRoleOrGroupDetail(table) {
        const { navigate } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
        var val = event.payload.cell.metadata;
        navigate({
            external: `nav_to.do?uri=${tabDef.table.referenceTable}.do?sys_id=${val.id}`
        });
    }

    //--------------------------------------------------------------------------------//

    ({
        rolePagination: paginate,
        groupPagination: paginate,
        userDetailPagination: paginate,
        dataSource: showErrorMessage,
        tabs_1: onTabChange,
        roleShowDiffCheckBox: showDifferences,
        groupShowDiffCheckBox: showDifferences,
        rolePList: navigateToRoleOrGroupDetail,
        groupPList: navigateToRoleOrGroupDetail,
        macroponent_ready: onPageReady
    } [event.elementId || event.name.toLowerCase()])();
}
