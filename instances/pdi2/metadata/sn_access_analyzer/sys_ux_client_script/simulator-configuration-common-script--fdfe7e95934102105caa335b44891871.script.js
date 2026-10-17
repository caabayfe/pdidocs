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

    const MACROPONENT_READY = "MACROPONENT_READY";
    const TAKEACTION_ENABLED = "enabled";
    const TAKEACTION_HIDDEN = "hidden";
    const LEGAL_INFO_MODAL_ID = "legalInfoWindow";
    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const gtt = imports["sn_access_analyzer.GlideTextTranslater"](api, helpers);

    const gvar = api.state.gvar;
    const translatedMessage = api.state.translatedMessage;

    async function onPageReady() {
        simUtil.updateState("loader", {
            message: await helpers.translate("Loading..."),
            visible: true
        });
        gtt.translate({
            alertMsgEnabled: helpers.translate("Taking actions on the Access Simulator has been enabled successfully."),
            alertMsgDisabled: helpers.translate("Taking actions on the Access Simulator has been disabled successfully."),
            alertMsgSuccess: helpers.translate("Success"),
            takeActionEnabled: helpers.translate("Enabled"),
            takeActionDisabled: helpers.translate("Disabled"),
            getSimSettingErr: helpers.translate("Unable to get simulator setting"),
            savingMsg: helpers.translate("Saving...")
        }).then(() => api.data.simulatorSettingLookupDB.refresh());
    }

    function saveSetting() {
        simUtil.hidePageError();
        simUtil.showLoader(translatedMessage.savingMsg);
        api.data.simulatorDB.execute({
            action: 'saveSimulatorSetting',
            payload: {
                takeAction: api.state.componentProps.takeActionEnabled ? TAKEACTION_ENABLED : TAKEACTION_HIDDEN
            }
        });
    }

    function toggleSimulator() {
        let status = event.payload.value;
        updateSetting("takeActionEnabled", status);
        updateTakeAction(status);
        gvar.isLegalInfoAccepted = false;
        if (status) {
            openLegalInfo();
        }
    }

    function onLegalAccept() {
        gvar.isLegalInfoAccepted = true;
        updateSetting("takeActionEnabled", true);
        closeLegalInfo();
    }

    function onModalClose() {
        if (api.state.componentProps.legalInfoModalReadOnly)
            return;
        //Revert the toggle button status if "Declined"
        if (!gvar.isLegalInfoAccepted) {
            updateTakeAction(false);
            updateSetting("takeActionEnabled", false);
        }
    }

    function loadSimulatorConfigurations() {
        simUtil.hideLoader();
        if (simUtil.hasServerError(event)) {
            simUtil.updateComponentProps({
                pageLoaded: true,
            });
            simUtil.showPageError();
            return;
        }

        let takeAction = api.data.simulatorSettingLookupDB.result.value.value;
        let takeActionEnabled = takeAction == TAKEACTION_ENABLED;
        updateSetting("takeActionEnabled", takeActionEnabled);
        gvar.prevSetting = JSON.stringify(api.state.setting);
        simUtil.updateComponentProps({
            takeActionEnabled: takeActionEnabled,
            takeActionLabel: takeActionEnabled ? translatedMessage.takeActionEnabled : translatedMessage.takeActionDisabled,
            pageLoaded: true,
            saveButtonEnabled: false
        });
    }

    function updateTakeAction(status) {
        simUtil.updateComponentProps({
            takeActionEnabled: status,
            takeActionLabel: status ? translatedMessage.takeActionEnabled : translatedMessage.takeActionDisabled
        });
    }

    function simulatorDBHandler() {
        simUtil.hideLoader();
        if (simUtil.hasServerError(event)) {
            simUtil.showPageError();
            return;
        }

        gvar.prevSetting = JSON.stringify(api.state.setting);
        simUtil.updateScreenStatus(false);
        simUtil.updateComponentProps("saveButtonEnabled", false);
        simUtil.addNotification(translatedMessage.alertMsgSuccess, (api.state.componentProps.takeActionEnabled) ?
            translatedMessage.alertMsgEnabled :
            translatedMessage.alertMsgDisabled, "positive", "circle-check-outline");
    }

    function openLegalInfo(readOnly = false) {
        simUtil.updateComponentProps("legalInfoModalReadOnly", readOnly);
        helpers.modal.open(LEGAL_INFO_MODAL_ID, {
            bare: true
        });
    }

    function updateSetting(key, value) {
        api.state.setting[key] = value;
        let updated = gvar.prevSetting != undefined && gvar.prevSetting != JSON.stringify(api.state.setting);
        simUtil.updateComponentProps("saveButtonEnabled", updated);
        simUtil.updateScreenStatus(updated);
        simUtil.removeNotification();
    }

    function closeLegalInfo() {
        helpers.modal.close(LEGAL_INFO_MODAL_ID);
    }

    simUtil.execute({
        MACROPONENT_READY: onPageReady,
        saveSimulatorSettingButton: saveSetting,
        takeActionToggle: toggleSimulator,
        legalInfoAcceptButton: onLegalAccept,
        legalInfoDeclineButton: closeLegalInfo,
        legalInfoWindow: onModalClose,
        legalInfoButtnOk: closeLegalInfo,
        simulatorSettingLookupDB: loadSimulatorConfigurations,
        simulatorDB: simulatorDBHandler,
        legalInfoLink: () => openLegalInfo(true)
    }, event);

}
