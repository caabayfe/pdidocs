(function executeRule(current, previous /*null when async*/) {
	var currentSysId = current.getValue("sc_cat_item");
    if (currentSysId)
        new sn_ais.IndexEvent().indexRecord("sc_cat_item", currentSysId);

    if (previous != null) {
        previousSysid = previous.getValue("sc_cat_item");
        if (previousSysid && previousSysid != currentSysId)
            new sn_ais.IndexEvent().indexRecord("sc_cat_item", previousSysid);
    }

})(current, previous);
