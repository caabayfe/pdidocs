/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        value
    } = event.payload;

    let {
        listTable,
        listFilter: certRecordsListFilter
    } = api.data.data_cert_get_records_list_info.output;

    let experienceURL = helpers.getCurrentExperienceUrl();
    api.setState("transformScriptArgs", {
            instanceId: api.context.props.sysId,
            certificationFields: api.data.data_cert_get_records_list_info?.output?.certificationFields,
            experienceURL: experienceURL
        }
    );

    if (value == "certified") {
        certRecordsListFilter += '^state=certified^ORcontains_certified_attributes=true';
    } else if (value == "failed") {
        certRecordsListFilter += '^state=failed^ORcontains_failed_attributes=true';
    }
    certRecordsListFilter += '^ENDRLQUERY^ORDERBYsys_id';
    api.setState("certRecordsListFilter", certRecordsListFilter);
}
