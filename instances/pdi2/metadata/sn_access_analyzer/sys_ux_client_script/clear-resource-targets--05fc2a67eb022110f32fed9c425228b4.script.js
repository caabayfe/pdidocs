/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("selectedRESTEndpoint", null);
    api.setState("selectedRESTMethod", "get");
    api.setState("selectedClientScript", null);
    api.setState("selectedUIPage", null);
    api.setState("selectedTable", null);
    api.setState("selectedTableDisplayVal", null);
    api.setState("selectedRecord", null);
    api.setState("selectedField", null);
    api.setState("selectedRecordDisplayVal", null);
    api.setState("selectedFieldDisplayVal", null);
    api.setState("tableTypeaheadVal", null);
    api.setState("recordTypeaheadEncQuery", null);
    api.setState("fieldTypeaheadVal", null);
    api.setState("clientScriptKeyword", null);
    api.setState("showMandatoryError", false);
    api.setState("selectedAIAgent", null);
    api.setState("aiAgentKeyword", null);
    api.setState("selectedAgentUsecase", null);
    api.setState("agentUsecaseKeyword", null);
}
