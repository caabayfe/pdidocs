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
    const MODELESS_DIALOG = 'modeless_dialog_default';
    const MODELESS_DIALOG_2 = 'modeless_dialog_default_2';
    const VIEW_CHAT_TRANSCRIPT = 'view_chat_transcript';
    const VIEW_WORK_NOTES = 'view_work_notes';
    var sowRecordInformationUtils = imports['sn_sow_itsm_common.SOWRecordInformationUtils']();

    let element = event.elementId;
    switch (element) {
        case MODELESS_DIALOG:
            sowRecordInformationUtils.setFocus(helpers,200,[VIEW_CHAT_TRANSCRIPT]);
            break;
        case MODELESS_DIALOG_2:
            sowRecordInformationUtils.setFocus(helpers,200,[VIEW_WORK_NOTES]);
            break;
        case VIEW_CHAT_TRANSCRIPT:
            sowRecordInformationUtils.setFocus(helpers,400,["repeater_3", api.state.modelessDialogOpenedCount, MODELESS_DIALOG]);
            break;
        case VIEW_WORK_NOTES:
            sowRecordInformationUtils.setFocus(helpers,400,["repeater_3", api.state.modelessDialogOpenedCount, MODELESS_DIALOG_2]);
            break;
    }
}
