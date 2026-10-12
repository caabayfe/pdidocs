(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (current.operation() == "update" || current.operation() == "delete") {

        var usageGr = new GlideRecord("sys_one_extend_usage");
        usageGr.addActiveQuery();
        usageGr.addQuery("definition", current.definition);
        usageGr.query();

        if (usageGr.next()) {
            gs.addErrorMessage(gs.getMessage("There is one or more active usage for this definition. Please mark all the related usage inactive in sys_one_extend_usage table before making this change."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
