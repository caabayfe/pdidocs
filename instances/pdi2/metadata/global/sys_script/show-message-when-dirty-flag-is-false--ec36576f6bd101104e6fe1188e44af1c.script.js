(function executeRule(current, previous /*null when async*/ ) {
    var grVersion = new GlideRecord("promin_model_def_version");
    grVersion.addQuery("project", current.project);
    grVersion.addQuery("state", "AVAILABLE");
    grVersion.query();
    if (grVersion.next())
        gs.addInfoMessage(
            gs.getMessage("If you wish to change table configuration then the existing Project definition versions will be eventually deleted. You need to click 'Mine Project' again for recalculation.")
        );

})(current, previous);
