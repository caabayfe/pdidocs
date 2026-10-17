(function executeRule(current, previous /*null when async*/ ) {
    var currentSysId = current.getValue("sc_cat_item");
    var tableName = current.sc_cat_item.sys_class_name + '';

    if (currentSysId)
        new sn_ais.IndexEvent().indexRecord(tableName, currentSysId);

    if (previous != null) {
        previousSysid = previous.getValue("sc_cat_item");
        if (previousSysid && previousSysid != currentSysId)
            new sn_ais.IndexEvent().indexRecord(tableName, previousSysid);
    }

})(current, previous);
