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

    const USER_TYPEAHEAD = "userTypeahead";
    const TABLE_TYPEAHEAD = "tableTypeahead";
    const RECORD_TYPEAHEAD = "recordTypeahead";
    const FIELD_TYPEAHEAD = "fieldTypeahead";
    const GROUP_ROLE_TYPEAHEAD = "groupRoleTypeahead";

    const ACTION_ADD_ROLE = "add-role";
    const ACTION_REMOVE_ROLE = "remove-role";
    const ACTION_ADD_GROUP = "add-group";
    const ACTION_REMOVE_GROUP = "remove-group";

    const typeaheadConf = api.state.typeaheadConf;

    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api, helpers);
    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api);
    const gtt = imports["sn_access_analyzer.GlideTextTranslater"](api);
    let translatedMessage = api.state.translatedMessage;

    function pageReady() {
        // Resetting global variable is required since, when we come back
        // from any other page, the gvar value will not be reset automatically.
        api.setState("gvar", {});

        let action = api.context.props.payload.payload.pageParams.action;

        let promises = {
            validUser: helpers.translate("Select a valid user"),
            validTable: helpers.translate("Select a valid table"),
            validField: helpers.translate("Select a valid field"),
            validRecord: helpers.translate("Select a valid record"),
            validating: helpers.translate("Validating..."),
            checkInhRole: helpers.translate("Checking inherited role..."),
            refresh: helpers.translate("Refreshing...")
        };

        let errMap = {};

        switch (action) {
            case ACTION_ADD_ROLE:
                errMap.existingRole = helpers.translate("Existing role cannot be assigned. Try assigning roles that are not assigned to the user.");
                errMap.conflictingRoles = helpers.translate("The role you selected conflicts with the user’s existing role. Try choosing a different role. For example, you cannot assign a user both the snc_internal and snc_external roles.");
                break;
            case ACTION_REMOVE_ROLE:
                errMap.inhRoleCantRemove = helpers.translate("Cannot remove inherited roles. Select another one.");
                errMap.roleDoesntExist = helpers.translate("We can't find this role assigned to the user. Choose a different one.");
                break;
            case ACTION_ADD_GROUP:
                errMap.cantAssignExistingGroup = helpers.translate("Existing group cannot be assigned. Try assigning groups that are not assigned to the user.");
                break;
            case ACTION_REMOVE_GROUP:
                errMap.groupDoesntExist = helpers.translate("We couldn't locate that user in this group. Select a different one.");
                break;
        }

        if (action == ACTION_ADD_ROLE || action == ACTION_REMOVE_ROLE) {
            promises.selectRoleOrGroup = helpers.translate('Select role');
            promises.typingWord = helpers.translate('Start typing a role name to select form the list');
            promises.validRoleOrGroup = helpers.translate('Select a valid role');
            promises.viewRoleOrGroup = helpers.translate('View Roles');
        } else {
            promises.selectRoleOrGroup = helpers.translate('Select group');
            promises.typingWord = helpers.translate('Start typing a group name to select form the list');
            promises.validRoleOrGroup = helpers.translate('Select a valid group');
            promises.viewRoleOrGroup = helpers.translate('View Groups');
        }

        Object.assign(promises, errMap);

        gtt.translate(promises, null).then(transMsg => updateTranslatedText(transMsg, errMap));
    }

    /**
     * Updated translated text on configuration as well as component
     */
    function updateTranslatedText(transMsg, errMap) {

        let typeaheads = typeaheadConf.typeaheads;
        typeaheads[USER_TYPEAHEAD].errors["default"] = transMsg.validUser;
        typeaheads[TABLE_TYPEAHEAD].errors["default"] = transMsg.validTable;
        typeaheads[FIELD_TYPEAHEAD].errors["default"] = transMsg.validField;
        typeaheads[RECORD_TYPEAHEAD].errors["default"] = transMsg.validRecord;

        let grErrors = typeaheads[GROUP_ROLE_TYPEAHEAD].errors;
        grErrors["default"] = transMsg.validRoleOrGroup;
        for (let id in errMap) {
            grErrors[id] = transMsg[id];
        }

        simUtil.updateState(GROUP_ROLE_TYPEAHEAD, {
            label: transMsg.selectRoleOrGroup,
            helperText: transMsg.typingWord
        });

        simUtil.updateState("componentProps", {
            viewRoleOrGroup: transMsg.viewRoleOrGroup,
            pageLoaded: true
        });

        translatedMessage.validating = transMsg.validating;
        translatedMessage.checkInhRole = transMsg.checkInhRole;

        subPageHandler.hideLoader();
    }

    function openUserDetailTab() {
        helpers.navigate.to(null, null, null, null, null, null, {
            url: '/sys_user.do?sys_id=' + api.state.userTypeahead.selectedItemId
        });
    }

    simUtil.execute({
        MACROPONENT_READY: pageReady,
        btnUserDetail: openUserDetailTab
    }, event);
}
