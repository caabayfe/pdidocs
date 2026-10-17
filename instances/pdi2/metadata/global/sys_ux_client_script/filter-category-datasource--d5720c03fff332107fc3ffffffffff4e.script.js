/**
* @param {params} params
* @param {api} params.api
* @param {ApiHelpers} params.helpers
*/
function evaluator({ api, helpers }) {
    const applicationSysId = api.context.props.applicationSysId;
    
    const datasource = {
        payload: {
            primaryKey: "sys_id",
            table: "sys_error_cat"
        },
        type: "table"
    };
    
    if (applicationSysId) {
        datasource.encodedQuery = `source_application=${applicationSysId}`;
    }
    
    return datasource;
}
