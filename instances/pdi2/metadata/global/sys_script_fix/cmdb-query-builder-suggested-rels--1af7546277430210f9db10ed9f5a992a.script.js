if (!pm.isZboot()) {
    gs.info("Fix Script: Started CMDBQueryBuilderSuggestedRels Upgrade Cleanup");

    var sysAutoGr = new GlideRecord("sysauto_script");
    if (sysAutoGr.isValid()) {
        sysAutoGr.addQuery("sys_id", "ce1fd1d3c700220039b82cdb8e9763c6");
        sysAutoGr.query();
        if (sysAutoGr.next()) {
            sysAutoGr.deleteRecord();
            gs.info("Fix Script: CMDBQueryBuilderSuggestedRels - Deleted Old Suggested Relations Scheduled job");

        }
    }

    var sysTriggerGr = new GlideRecord("sys_trigger");
    if (sysTriggerGr.isValid()) {
        sysTriggerGr.addQuery("name", "CMDB Query Builder suggested relationships cache refresh");
        sysTriggerGr.query();
        if (sysTriggerGr.next()) {
            sysTriggerGr.deleteRecord();
            gs.info("Fix Script: CMDBQueryBuilderSuggestedRels - Deleted Old Suggested Relations SysTrigger job");
        }
    }

    var suggestedRelsGr = new GlideRecord("cmdb_class_relationships");
    if (suggestedRelsGr.isValid()) {
        suggestedRelsGr.addNullQuery("parent");
        suggestedRelsGr.query();
        if (suggestedRelsGr.next()) {
            suggestedRelsGr.deleteRecord();
            gs.info("Fix Script: CMDBQueryBuilderSuggestedRels - Deleted Old Suggested Relations table records");
        }
    }
    gs.info("Fix Script: Completed CMDB Query Builder Suggested Rels Upgrade Cleanup");

}
