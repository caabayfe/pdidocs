/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        buildFieldMetadata
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const output = api?.data?.get_cmdb_group_query_metadata_details?.output;
    if (!output)
        return;

    let classDetails = [];
    let item = {};
    item.label = output["class"].label;
    item.displayValue = output["class"].name;
    let metadata = buildFieldMetadata(item);
    classDetails.push(metadata);

    api.setState("classDetails", classDetails);
    api.setState("className", output["class"].name);
    api.setState("encodedQuery", output["encodedQuery"]);
    api.setState("groupMetadataDataFetched", true);
}
