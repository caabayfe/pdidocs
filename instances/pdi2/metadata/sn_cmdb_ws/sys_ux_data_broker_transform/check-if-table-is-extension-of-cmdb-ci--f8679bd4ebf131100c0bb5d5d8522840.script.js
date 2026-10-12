function transform(input) {
    var table = input.table;
    if (!table) {
        return {
            result: false
        };
    }
    var util = new sn_cmdb_pg_templts.CMDBPageTemplatesUtility();
    var wsUtil = new CMDBWorkspaceUtil();
    return {
        result: util.isExtensionOfCmdbCi(table),
        properties: {
            isExploreCiEnabled: wsUtil.getSystemProperty(wsUtil.SYS_PROPERTIES_NAME.EXPLORE_CI_RECORD_ENABLED, wsUtil.DATATYPE.BOOLEAN, false)
        }
    };
}
