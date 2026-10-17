(function executeRule(current, previous /*null when async*/ ) {

    var userPropertyConfigGA = new GlideAggregate("sys_analytics_user_property_config");
    userPropertyConfigGA.addAggregate("count");
    userPropertyConfigGA.query();
    if (userPropertyConfigGA.next()) {
        if (userPropertyConfigGA.getAggregate("count") >= 20) {
            gs.addErrorMessage(gs.getMessage("Configuration limit exceeded: A maximum of 20 user properties can be configured."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
