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
    const communicationDetailsTaskFilterUtil = imports["sn_uib_tcm.CommunicationDetailsTaskFilterUtil"]();
    const controllerConstants = communicationDetailsTaskFilterUtil.CONSTANTS;
    const translatedMessages = await communicationDetailsTaskFilterUtil.getTranslatedMessages(helpers);
    let controllerOutput = communicationDetailsTaskFilterUtil.getOutputTemplate();
    controllerOutput.type = controllerConstants.DIRECT_CHAT_DATA_TYPE;
    controllerOutput["DIRECT_CHAT"] = api.data.fetch_all_direct_collaboration_chats.output;
    controllerOutput.status = true;
    controllerOutput.success_messages.push(
        translatedMessages.DIRECT_CHAT_DATA_SUCCESS_MESSAGE
    );
    communicationDetailsTaskFilterUtil.filteredDataOutput(api, controllerOutput);
}
