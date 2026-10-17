(function executeRule(current, previous) {
    var err = MiUtil.MidConfigParamsVeification[current.getValue("param_name")](current);
    if (!gs.nil(err)) {
        gs.addErrorMessage(gs.getMessage("Error: {0}", err));
        current.setAbortAction(true);
    }
})(current, previous);
