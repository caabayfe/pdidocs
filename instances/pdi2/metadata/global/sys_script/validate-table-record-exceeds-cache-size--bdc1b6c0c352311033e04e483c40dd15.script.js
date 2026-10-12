(function executeRule(current, previous /*null when async*/ ) {
    var tableName = current.sys_class_name;
    var result = SNC.AuthPolicyIPUtil.doesTableHaveMoreRecordsThanCache(tableName);

    if (result) {
        var cachePropertyName = SNC.AuthPolicyIPUtil.getCachePropertyForTable(tableName);
        if (GlideStringUtil.notNil(cachePropertyName))
            gs.addInfoMessage(gs.getMessage(tableName + " has more records than cache defined for filter criteria. Refer <a href=https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB1548383>KB1548383</a>\
			for best practice on crafting filter Criteria. " + cachePropertyName + " system property should be updated to change the length of the cache for the table " + tableName + " as per business use case."));
    }

})(current, previous);
