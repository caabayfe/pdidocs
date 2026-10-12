/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const isCreator = String(api.data.sub_ent_record.result.meter_type.value).toLowerCase() === "creator";
    api.setState("isMeterTypeCreator" , isCreator);
}
