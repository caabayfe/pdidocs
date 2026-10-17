(function executeRule(current, previous /*null when async*/ ) {
    var grVersion = new GlideRecord("promin_model_def_version");
    grVersion.addQuery("project", current.entity.project);
    grVersion.addQuery("state", "AVAILABLE");
    grVersion.query();
    if (grVersion.next())
        new global.ProminUtilsAJAX().showMessageWhenDirtyFlagIsFalse(current);
})(current, previous);
