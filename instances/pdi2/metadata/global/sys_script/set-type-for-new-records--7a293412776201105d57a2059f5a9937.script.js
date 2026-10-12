(function executeRule(current, previous /*null when async*/ ) {
    if (!current.isNewRecord())
        return;
    if (gs.hasRole("maint")) {
        current.setValue("type", "snc_internal");
    } else {
        current.setValue("type", "snc_external");
    }

})(current, previous);
