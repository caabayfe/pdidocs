/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
 const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
 const translatedMessages = await playBookCommunicationCardUtil.getTranslatedMessages(helpers);
 api.setState("translatedMessages",translatedMessages);
}
