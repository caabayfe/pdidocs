(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var tableName = request.pathParams.tableName;
    const VIEW_CONFIG_TABLE = "sys_sg_view_config";
    var openModalUtil = new McbOpenModalUtil();
    var totalRecordCount = openModalUtil._getTableRecordCount(tableName);
    var totalApplications = openModalUtil._getApplications(tableName);
    var result = {
        records: totalRecordCount,
        applications: totalApplications,
    };
    if (tableName == VIEW_CONFIG_TABLE)
        result.applets = openModalUtil._getApplets();

    return result;
})(request, response);
