(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (current.operation() == "update" && current.active == false && previous.active == true) {

        var usageActiveGr = new GlideRecord("sys_one_extend_usage");
        usageActiveGr.addActiveQuery();
        usageActiveGr.addQuery("definition", current.sys_id);
        usageActiveGr.query();

        if (usageActiveGr.next()) {
            gs.addErrorMessage(gs.getMessage("There is one or more active usage for this definition. Please mark all the related usage inactive in sys_one_extend_usage table before making this definition inactive."));
            current.setAbortAction(true);
        }
    } else if (current.operation() == "delete") {
        var usageGr = new GlideRecord("sys_one_extend_usage");
        usageGr.addQuery("definition", current.sys_id);
        usageGr.query();

        if (usageGr.next()) {
            gs.addErrorMessage(gs.getMessage("There is one or more usage associated with this capability. Please delete all the related usage in sys_one_extend_usage table before deleting this definition."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
