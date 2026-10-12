(function executeRule(current, previous /*null when async*/ ) {
    new global.MIUtil().updatePageProperty("app_enabled", current.value == "true");
})(current, previous);
