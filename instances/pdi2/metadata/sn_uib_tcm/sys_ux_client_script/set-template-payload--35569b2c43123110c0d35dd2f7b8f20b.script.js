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
    const TMP_DB_STATE_MAP = {
        "get_email_client_templates": "emailTemplates",
        "get_sms_templates": "smsTemplates",
        "get_dex_templates": "dexTemplates"
    };
    var templates = [];
    if (event.elementId == "get_email_client_templates" && api.data.show_genai_template.output && api.data.show_genai_template.output.skill == "752f06c03b07d2107630a29a04e45a60" && api.data.show_genai_template.output.response) {
        const nowAssistUtils = imports['sn_itsm_gen_ai.NowAssistForITSMClientUtils']();
        templates = await nowAssistUtils.getGenAISegregatedTemplates(api, event, helpers);
    } else {
        const results = (event.elementId == "get_email_client_templates") ? api.data[event.elementId].output.results : api.data[event.elementId].results;
        for (const item of results) {
            const newItem = {
                "id": item._row_data.uniqueValue,
                "label": item.name.displayValue
            };
            templates.push(newItem);
        }
    }
    api.setState(TMP_DB_STATE_MAP[event.elementId], templates);
}
