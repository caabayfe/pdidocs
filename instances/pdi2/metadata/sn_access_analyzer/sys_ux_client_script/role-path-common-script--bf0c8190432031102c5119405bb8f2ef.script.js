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

    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);
    const {
        navigate,
        navTo
    } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const props = api.state.props;


    const onPageReady = () => {
        aaUtil.log("onPageReadyHandler of NodeMap Page");
        aaUtil.updateState('baseUserFilter', 'listItems', api.state.defaultFilter);
        aaUtil.updateState('modelUserFilter', 'listItems', api.state.defaultFilter);

        api.state.baseUser.loadingState = true;
        api.state.modelUser.loadingState = true;
        let tms = api.state.translatedMessages;

        helpers.translate("User").then(label => tms.User = label);
        helpers.translate("Group").then(label => tms.Group = label);
        helpers.translate("Role").then(label => tms.Role = label);

        var p = { ...api.state.props
        };
        p.selectedTabIndex = 0;
        p.dataLoaded = undefined;
        api.setState("props", p);

        helpers.translate("Oops! The user doesn't have the necessary role(s)") //
            .then(label => {
                api.state.baseUserEmptyState.messages.noRoles.heading = label;
                api.state.modelUserEmptyState.messages.noRoles.heading = label;
            });

        helpers.translate("You can view the role hierarchy for the user after adding the role required by the ACL.") //
            .then(label => {
                api.state.baseUserEmptyState.messages.noRoles.content = label;
                api.state.modelUserEmptyState.messages.noRoles.content = label;
            });

        helpers.translate("Sorry, there are too many nodes to show") //
            .then(label => {
                api.state.baseUserEmptyState.messages.overload.heading = label;
                api.state.modelUserEmptyState.messages.overload.heading = label;
            });
        helpers.translate("You can view the resource on the platform.") //
            .then(label => {
                api.state.baseUserEmptyState.messages.overload.content = label;
                api.state.modelUserEmptyState.messages.overload.content = label;
            });
            
        //translations
        helpers.translate("How to read the results on the showing role hierarchy page?") //
            .then(label => tms.accordionItem1 = label);
        helpers.translate("How can I see the details of the user?") //
            .then(label => tms.accordionItem2 = label);
        helpers.translate("How can I see the details of the role?") //
            .then(label => tms.accordionItem3 = label);
        helpers.translate("How can I see the details of the resources the role can access?") //
            .then(label => tms.accordionItem5 = label);
        helpers.translate("How can I see the details of the group?") //
            .then(label => tms.accordionItem4 = label);

        helpers.translate("Showing {0} Insights", "{count}") //
            .then(label => tms.insightsCount = label);

        helpers.translate("Access Insights for").then(label => tms.accessInsightsFor = label);

        helpers.translate("Loading...").then(label => aaUtil.updateState('loader', 'message', label));

        helpers.translate("Filter").then(label => {
            aaUtil.updateState('baseUserFilter', 'title', label);
            aaUtil.updateState('modelUserFilter', 'title', label);
        });

        let promises = [
            helpers.translate("Group - Peer Insights"),
            helpers.translate("Group - Org Insights"),
            helpers.translate("Role - Peer Insights"),
            helpers.translate("Role - Org Insights")
        ];
        Promise.all(promises).then(values => {
            let filterItems = api.state.defaultFilter;
            values.forEach((val, index) => {
                let obj = {...filterItems[index]};
                obj.label = val;
                filterItems[index] = obj;
            });

            aaUtil.updateState('baseUserFilter', 'listItems', filterItems);
            aaUtil.updateState('modelUserFilter', 'listItems', filterItems);

        });
    };

    // ------------------------------------------------------------//

    const showRequiredRoles = () => {
        if (event.payload.item.action === "viewRoles") {
            helpers.modal.open("requiredRoles", {
                bare: true
            });
        }
    };

    // ------------------------------------------------------------//

    const showRoleDetail = () => aaUtil.navigate({
        external: "/nav_to.do?uri=" + event.payload.table + ".do?sys_id=" + event.payload.sys_id
    });

    const emptyStateHandler = () => {
        const action = event.payload.action;
        if (action.name == 'open_link') {
            navigate({
                external: navTo(action.tableName, action.id)
            });
        }
    };

    ({
        macroponent_ready: onPageReady,
        requestInfo: showRequiredRoles,
        requiredRolesList: showRoleDetail,
        baseUserEmptyState: emptyStateHandler,
        modelUserEmptyState: emptyStateHandler
    } [event.elementId || event.name.toLowerCase()])();
}
