(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (current.operation() == "update" && current.active == false && previous.active == true) {

        var builderActiveGr = new GlideRecord("sys_one_extend_builder_capability");
        builderActiveGr.addActiveQuery();
        builderActiveGr.addQuery("builder", current.sys_id);
        builderActiveGr.query();

        if (builderActiveGr.next()) {
            gs.addErrorMessage(gs.getMessage("There is one or more active capability mapped to this builder. Please mark all the related builder capabilities inactive in sys_one_extend_builder_capability table before making this builder configuration inactive."));
            current.setAbortAction(true);
        }
    } else if (current.operation() == "delete") {
        var builderGr = new GlideRecord("sys_one_extend_builder_capability");
        builderGr.addQuery("builder", current.sys_id);
        builderGr.query();

        if (builderGr.next()) {
            gs.addErrorMessage(gs.getMessage("There is one or more capability mapped to this builder. Please delete all the related builder capabilities before deleting this builder configuration."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
