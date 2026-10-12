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

    const TAKE_ACTION_LEGAL_INFO_MODAL_ID = "take_action_legal_modal";
    const TAKE_ACTION_ENABLED = "enabled";
    const TAKE_ACTION_DISABLED = "disabled";
    const TAKE_ACTION_HIDDEN = "hidden";
    const BUTTON_COMPLETE = "complete";
    const BUTTON_START_OVER = "startOver";
    const BUTTON_SKIP_AND_EXIT = "skipAndExit";
    const ACTION_ADD_ROLE = "add-role";
    const ACTION_REMOVE_ROLE = "remove-role";
    const ACTION_ADD_GROUP = "add-group";
    const ACTION_REMOVE_GROUP = "remove-group";

    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);

    const onSkipButtonClicked = () => {
        api.setState('status', cxt => ({
            ...cxt.currentValue,
            title: cxt.currentValue.skip.title,
            message: cxt.currentValue.skip.message
        }));
        helpers.modal.open("status_modal");
    };

    const onTakeActionButtonClicked = () => {

        subPageHandler.hidePageError();
        subPageHandler.showLoader(api.state.status.msgSaving);
        api.setState('takingAction', true);
        api.data.look_up_sim_settings.refresh(); // settings safe check
    };

    function scheduleJob(name, script) {
        const templateFields = `state=0^` +
            `trigger_type=0^` +
            `name=${name}^` +
            `job_id=81c92ce9c0a8016400e5f0d2f784ea78^` +
            `script=${script}`;
        api.data.create_record.execute({
            table: 'sys_trigger',
            templateFields: templateFields
        });
    }

    function addUserToGroup(group, user) {
        const script = `var grpMbrGR \\= new GlideRecord('sys_user_grmember');` +
            `grpMbrGR.setValue('user','${user}');` +
            `grpMbrGR.setValue('group','${group}');` +
            `grpMbrGR.insert();`;
        scheduleJob("Simulate user addition to a group", script);
    }

    function removeUserFromGroup(sysID) {
        const script = `var grpMbrGR \\= new GlideRecord('sys_user_grmember');` +
            `grpMbrGR.get('${sysID}');` +
            `grpMbrGR.deleteRecord();`;
        scheduleJob("Simulate user removal from a group", script);
    }


    const takeAction = () => {
        const reqPayload = api.state.requestPayload;
        switch (api.state.pageParams.action) {
            case ACTION_ADD_ROLE:
                api.data.create_record.execute({
                    table: 'sys_user_has_role',
                    templateFields: `user=${reqPayload.user.id}^role=${reqPayload.role.id}`
                });
                break;
            case ACTION_REMOVE_ROLE:
                queryFor("sys_user_has_role", `user=${reqPayload.user.id}^role=${reqPayload.role.id}^inherited=false`);
                break;
            case ACTION_ADD_GROUP:
                addUserToGroup(reqPayload.group.id, reqPayload.user.id);
                break;
            case ACTION_REMOVE_GROUP:
                queryFor("sys_user_grmember", `user=${reqPayload.user.id}^group=${reqPayload.group.id}`);
                break;
        }
    };

    const queryFor = (table, condition) => {
        api.state.query.tableName = table;
        api.state.query.conditions = condition;
        api.data.query.refresh();
    };

    const closeServerErrorModal = () => helpers.modal.close('server_error_modal');

    const onServerErrorExitBtnClick = () => {
        closeServerErrorModal();
        subPageHandler.exit();
    };

    const onTakeActionDisabledExitBtnClicked = () => {
        helpers.modal.close('take_action_disabled_modal');
        subPageHandler.exit();
    };

    const onTakeActionSuccess = () => {
        subPageHandler.hideLoader();

        if (simUtil.hasServerError(event)) {
            subPageHandler.showPageError();
            return;
        }

        let glideMutation = event.payload.data.output.data.GlideRecord_Mutation;
        let action = api.state.pageParams.action;
        
        if ((action == ACTION_ADD_ROLE && glideMutation.insert_sys_user_has_role == null) ||
            (action == ACTION_ADD_GROUP && glideMutation.insert_sys_trigger == null) ||
            (action == ACTION_REMOVE_ROLE && glideMutation.delete_sys_user_has_role.modified_count == 0) ||
            (action == ACTION_REMOVE_GROUP && glideMutation.insert_sys_trigger == null)) {
            helpers.modal.open("server_error_modal");
            return;
        }

        api.setState('status', cxt => {
            return {
                ...cxt.currentValue,
                title: cxt.currentValue.success.title,
                message: cxt.currentValue.success.message
            };
        });
        helpers.modal.open("status_modal");
    };

    const onQuerySuccess = () => {
        if (simUtil.hasServerError(event)) {
            subPageHandler.showPageError();
            return;
        }

        let tableName = api.state.query.tableName;
        let glideQuery = api.data.query.output.data.GlideRecord_Query[tableName];
        let rowCount = glideQuery._rowCount;
        if (rowCount != 1) {
            subPageHandler.hideLoader();
            helpers.modal.open("server_error_modal");
        } else {
            _deleteRecord(tableName, glideQuery);
        }
    };

    const _deleteRecord = (tableName, glideQuery) => {
        if (tableName === 'sys_user_grmember') {
            removeUserFromGroup(glideQuery._results[0].sys_id.value);
            return;
        }
        //Deletion from sys_user_has_role table is not done via job
        api.data.delete_record.execute({
            table: tableName,
            recordId: glideQuery._results[0].sys_id.value
        });
    };

    const onTermsAndConditionsCheck = (payload = event.payload) => _agreedTC(payload.value);

    const _agreedTC = (flag) => {
        simUtil.updateState('simulationInfoConfig', 'agreedTC', flag);
        flag ? subPageHandler.enableButtons(BUTTON_COMPLETE) : subPageHandler.disableButtons(BUTTON_COMPLETE);
    };

    const onStatusModalClose = () => {
        helpers.modal.close('status_modal');
        subPageHandler.exit();
    };

    function onLoadSimulatorSetting() {
        if (simUtil.hasServerError(event)) {
            subPageHandler.showPageError();
            return;
        }

        let simulatorConfigurations = api.data.look_up_sim_settings.result.value.value;

        if (api.state.takingAction) { // differentiates parent calls
            if (simulatorConfigurations === TAKE_ACTION_ENABLED) {
                takeAction();
            } else {
                subPageHandler.hideLoader();
                helpers.modal.open('take_action_disabled_modal');
            }
            api.setState('takingAction', false);
            return;
        }

        subPageHandler.hideLoader();

        if (simulatorConfigurations === TAKE_ACTION_DISABLED) {
            updateComponentProps(TAKE_ACTION_DISABLED);
        } else if (simulatorConfigurations === TAKE_ACTION_ENABLED) {
            simUtil.updateState('simulationInfoConfig', {
                returningUser: true,
                agreedTC: true
            });
            subPageHandler.enableButtons(BUTTON_COMPLETE);
        }
    }

    const onEnableButtonClicked = () => _showLegalModal();

    const _showLegalModal = () => {
        helpers.modal.open(TAKE_ACTION_LEGAL_INFO_MODAL_ID, {
            bare: true
        });
    };

    const onTermsAndConditionsClick = () => _showLegalModal();

    const onLegalSettingsClick = () => {
        helpers.navigate.to(null, null, null, null, null, null, {
            url: '/now/access-analyzer/home/params/selected-tab-index/2'
        });
    };

    const onTakeActionDisabledSettingsBtnClicked = () => {
        helpers.navigate.to(null, null, null, null, null, null, {
            url: '/now/access-analyzer/home/params/selected-tab-index/2'
        });
    };

    const onLegalOkayClick = () => helpers.modal.close(TAKE_ACTION_LEGAL_INFO_MODAL_ID);

    const onTakeActionDeclineBtnClicked = () => helpers.modal.close(TAKE_ACTION_LEGAL_INFO_MODAL_ID);

    const onTakeActionAcceptBtnClicked = () => {
        // admin has consciously decided to enable take action and this option will
        // not be shown in subsequent page visits
        saveAccessSimulatorSetting(true);
        helpers.modal.close(TAKE_ACTION_LEGAL_INFO_MODAL_ID);
    };

    const onHideActionBtnClicked = () => saveAccessSimulatorSetting(false);

    function updateComponentProps(takeActionStatus) {
        simUtil.updateComponentProps('takeActionStatus', takeActionStatus);
    }

    function saveAccessSimulatorSetting(takeActionEnabled) {
        subPageHandler.hidePageError();
        subPageHandler.showLoader(api.state.status.msgSaving);
        api.data.simulatorDB.execute({
            action: "saveSimulatorSetting",
            payload: {
                takeAction: takeActionEnabled ? TAKE_ACTION_ENABLED : TAKE_ACTION_HIDDEN
            }
        });
    }

    function simulatorDBResponseHandler() {
        subPageHandler.hideLoader();
        if (simUtil.hasServerError(event)) {
            subPageHandler.showPageError();
            return;
        }
        let req = event.payload.data.output.request;
        if (req.payload.takeAction == TAKE_ACTION_ENABLED) {
            updateComponentProps(TAKE_ACTION_ENABLED);
            subPageHandler.enableButtons(BUTTON_COMPLETE);
        } else {
            updateComponentProps(TAKE_ACTION_HIDDEN);
            subPageHandler.visibleButtons(BUTTON_START_OVER, BUTTON_SKIP_AND_EXIT);
            subPageHandler.hideButtons(BUTTON_COMPLETE);
        }
    }

    subPageHandler.onReceive("ON_COMPLETE_BUTTON_CLICKED", onTakeActionButtonClicked);
    subPageHandler.onReceive("ON_SKIP_AND_EXIT_BUTTON_CLICKED", onSkipButtonClicked);
    subPageHandler.handle(event);

    simUtil.execute({
        enable_action_button: onEnableButtonClicked,
        take_action_decline_btn: onTakeActionDeclineBtnClicked,
        take_action_accept_btn: onTakeActionAcceptBtnClicked,
        look_up_sim_settings: onLoadSimulatorSetting,
        hide_actions_button: onHideActionBtnClicked,
        create_record: onTakeActionSuccess,
        delete_record: onTakeActionSuccess,
        terms_and_conditions_link: onTermsAndConditionsClick,
        terms_and_conditions_checkbox: onTermsAndConditionsCheck,
        server_error_exit_btn: onServerErrorExitBtnClick,
        server_error_try_again_btn: closeServerErrorModal,
        query: onQuerySuccess,
        simulatorDB: simulatorDBResponseHandler,
        status_modal: onStatusModalClose,
        legal_settings: onLegalSettingsClick,
        legal_okay: onLegalOkayClick,
        take_action_disabled_exit_btn: onTakeActionDisabledExitBtnClicked,
        take_action_disabled_settings_btn: onTakeActionDisabledSettingsBtnClicked
    }, event);

}
