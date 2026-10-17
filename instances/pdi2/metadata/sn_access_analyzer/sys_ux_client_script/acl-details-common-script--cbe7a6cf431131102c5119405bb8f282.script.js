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
    const props = api.state.props;
    const modal = helpers.modal;
    const modalConf = {
        bare: true
    };
    // -------------------------------------------------------------------------------- //
    const onPageReady = () => {
        EvalStatus.translate();

        helpers.translate("Roles") .then(label => api.state.translatedMessages.roles = label);
        helpers.translate("Security attribute") .then(label => api.state.translatedMessages.securityAttribute = label);
        helpers.translate("Condition") .then(label => api.state.translatedMessages.condition = label);
        helpers.translate("Script") .then(label => api.state.translatedMessages.script = label);
        helpers.translate("Controlled by References") .then(label => api.state.translatedMessages.controlledByReferences = label);

        var messages = api.state.tableDef.messages;

        helpers.translate("Name") //
            .then(label => api.state.translatedMessages.name = label);

        helpers.translate("We're sorry. We couldn't find any access difference between the users.") 
            .then(label => messages.noDifference.heading = label);

        helpers.translate("It looks like both the users comply to the selected access control.") 
            .then(label => messages.noDifference.content = label);

        
        helpers.translate("This could be because the user doesn't have the required roles or the user has high privileged role")
            .then(label => messages.noRoles.label = label);
        helpers.translate("There's no role hierarchy information because the ACL doesn't have any roles defined")
            .then(label => messages.noACLs.label = label);

         //accordian items heading translation
          helpers.translate("How to read the results on the access control operation page?") 
              .then(label => api.state.translatedMessages.accordionItem1 = label);
          helpers.translate("What are the different evaluation states?") 
              .then(label => api.state.translatedMessages.accordionItem2 = label);
          helpers.translate("What is Show differences only?") 
              .then(label => api.state.translatedMessages.accordionItem3 = label);
          helpers.translate("How the ACL operation is evaluated?")
              .then(label => api.state.translatedMessages.accordionItem4 = label);
          
          const msgStrings = [
                helpers.translate('Rules for access control lists (ACLs) restrict access to data by requiring users to pass a set of requirements before they can interact with it. All access control list rules specify:'),
                helpers.translate('The object and operation being secured.'),
                helpers.translate('The permissions required to access the object.')
          ];
            Promise.all(msgStrings).then(translatedValues => api.state.translatedMessages.aclDetailDescription = '<p><span style="font-size: 12pt;">'+translatedValues[0]+'</span></p><ul style="padding-left: 25px;"><li style="font-size: 12pt;"><span style="font-size: 12pt;">'+translatedValues[1]+'</span></li><li style="font-size: 12pt;"><span style="font-size: 12pt;">'+translatedValues[2]+'</span></li></ul>');
    };

    // -------------------------------------------------------------------------------- //

    const pageNavigation = () => {
        navigate({
            external: "/nav_to.do?uri=" + event.payload.table + ".do?sys_id=" + event.payload.sys_id
        });
    };

    // -------------------------------------------------------------------------------- //

    const openRequiredRoles = () => {
        if (event.payload.item.action == "viewRoles") {
            modal.open("requiredRoles", modalConf);
        }
    };

    const openNoRoleAlert = () => modal.close("noRolesErrorAlert");

    // -------------------------------------------------------------------------------- //

    const showRoleHierarchy = () => {
        
        /*  The following conditions check whether the base or model user has at least one role required by the ACL and at least one user role status is not blocked.
            Note that when using previously searched criteria for compare access control, the following conditions will return false if both user’s role status is blocked 
            irrespective of whether props.userHasRequiredRoles is true i.e. even If any user has required roles of ACL assigned now. 
        */
        const userHasRolesAndGranted = props.userHasRequiredRoles && (props.baseUserRoleStatus !== 'blocked' || props.modelUserRoleStatus !== 'blocked');
        const isRoleHierarchyPresent = props.hasACL && userHasRolesAndGranted;

        if (!isRoleHierarchyPresent) {
            openNoRoleHierarchyModal(userHasRolesAndGranted);
            return;
        }

        const params = api.context.props;
        navigate({
            route: "compare-user-role-path",
            fields: {
                baseUserResultId: params.baseUserResultId,
                modelUserResultId: params.modelUserResultId,
                baseUserDebugLogId: params.baseUserDebugLogId,
                modelUserDebugLogId: params.modelUserDebugLogId
            }
        });
    };

    function openNoRoleHierarchyModal() {
        let tableDefClone = JSON.parse(JSON.stringify(api.state.tableDef));
        tableDefClone.emptyState.heading.label = getNoRoleHierarchyReason();
        api.setState("tableDef", tableDefClone);

        modal.open("noRolesErrorAlert", modalConf);
    }

    function getNoRoleHierarchyReason(userHasRolesAndGranted) {
        if (!props.hasACL) {
            return api.state.tableDef.messages.noACLs.label;
        } 
        if (!userHasRolesAndGranted) {
            return api.state.tableDef.messages.noRoles.label;
        }
        return "";
    }

    // -------------------------------------------------------------------------------- //
    function showDifference() {
        event.payload.value == true ? pListCtrl.showDifference() : pListCtrl.reset();
    }

    // Based on elementId or eventName above methods will be called
    ({
        requiredRolesList: pageNavigation,
        requestInfo: openRequiredRoles,
        modalButton: openNoRoleAlert,
        showRoleHierarchy: showRoleHierarchy,
        showDifference: showDifference,
        accessResult: showServerError,
        debugLog: showServerError,
        macroponent_ready: onPageReady,
        aaCommonDB: showServerError,
        sysSecurityACLRole: showServerError
    } [event.elementId || event.name.toLowerCase()])();

}
