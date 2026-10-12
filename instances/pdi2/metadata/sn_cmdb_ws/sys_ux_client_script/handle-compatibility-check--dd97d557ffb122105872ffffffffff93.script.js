/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        isCompatible
    } = api.data.check_compatibility.output;

    const {
        label,
        parentRecordSysId,
        parentTable,
        table,
        sourceField,
        targetField,
        targetTable
    } = api.state.relatedListPayload;
    
    api.emit('MANAGE_M2M#COMPATIBILITY_CHECK_SUCCESS', {
        isCompatible,
        tableLabel: label
    });
    
    if (!isCompatible) {
        const params = {
            sys_is_list: true,
            sys_is_related_list: true,
            sys_target: table,
            sysparm_collection: parentTable,
            sysparm_collectionID: parentRecordSysId,
            sysparm_collection_key: sourceField,
            sysparm_collection_label: label,
            sysparm_collection_related_field: targetField,
            sysparm_collection_related_file: targetTable,
            sysparm_m2m_ref: table,
            sysparm_stack: "no",
            sysparm_referring_url: `/now/cmdb/ci-record/${parentTable}/${parentRecordSysId}`
        };

        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        api.setState('legacyUrl', `/sys_m2m_template.do?${queryString}`);
        return;
    }

    api.setState('getRelatedPayload', {
        ...api.state.relatedListPayload
    });
}
