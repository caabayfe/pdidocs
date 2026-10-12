function openAccessAnalyzer() {
    var tableName = g_form.getTableName();
    var recordSysId = g_form.getUniqueValue();
    var ga = new GlideAjax("IdentitySecurityUtil");
    ga.addParam("sysparm_name", "getNewUISysPropValue");
    ga.getXMLAnswer(function (newUISysPropValue) {
        if (newUISysPropValue === "true") {
            var newUIURL = "/now/access-management/access-analyzer/params/target-table/" + tableName + "/target-record/" + recordSysId;
            nowapi.g_navigation.open(newUIURL, "_blank");
            return;
        }
        var urlNewRecord = "/sn_access_analyzer_request.do?sys_id=-1&sysparm_query=";
        var url = urlNewRecord + "analyze_by=User" +
            "^resource_type=record" +
            "^operations=read" +
            "^target_table=" + tableName +
            "^target_record=" + recordSysId;
        nowapi.g_navigation.open(url);
	});
}
