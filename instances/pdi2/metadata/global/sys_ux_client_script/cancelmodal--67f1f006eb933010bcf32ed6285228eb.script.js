/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

    api.data.update_record_1.execute({
        table: "sys_cs_general_settings",
        recordId: "586237553b1323009cbbcea234efc42f",
        templateFields: "mask_sensitive_information=true"
    });
}
