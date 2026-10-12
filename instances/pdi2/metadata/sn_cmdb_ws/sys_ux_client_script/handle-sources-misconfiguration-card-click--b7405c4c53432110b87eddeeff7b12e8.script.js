/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        TABLE_NAMES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const elementId = event.elementId;
    let tableName = TABLE_NAMES.SCHEDULED_IMPORT_SET;
    let listTitle = await helpers.translate("Scheduled Import sets");
    let encodedQuery = "";

    if (elementId == "batch_import_turned_off_card_container") {
        tableName = TABLE_NAMES.SYS_DATA_SOURCE;
        listTitle = await helpers.translate("Data sources");
        encodedQuery = "sys_idINjavascript:new sn_cmdb_ws.CMDBWsPerfInsightClientUtil().getIntegrationDatasourceSysIds()^use_batch_import=null^ORuse_batch_import=false";
    } else if (elementId == "concurrent_import_turned_off_card_container") {
        encodedQuery = "data_sourceINjavascript:new sn_cmdb_ws.CMDBWsPerfInsightClientUtil().getIntegrationDatasourceSysIds()^active=true^concurrent_import=null^ORconcurrent_import=false";
    } else if (elementId == "non_custom_size_partition_method_card_container") {
        encodedQuery = "data_sourceINjavascript:new sn_cmdb_ws.CMDBWsPerfInsightClientUtil().getIntegrationDatasourceSysIds()^active=true^partition_method=null^ORpartition_method!=customSize";
    }

    helpers.navigate.to(
        'list', {
            table: tableName
        }, {
            listTitle: listTitle,
            query: encodedQuery,
            view: "cmdb_ws"
        },
        false,
        false,
        'current',
        '',
        listTitle
    );
}
