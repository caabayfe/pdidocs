(function executeRule(current, previous /*null when async*/ ) {
    var configIdentiferGa = new GlideAggregate('sn_cmdb_ws_config_identifier');
    configIdentiferGa.addQuery('default', true);
    configIdentiferGa.addQuery('sys_id', "!=", current.getUniqueValue());
    configIdentiferGa.addAggregate('COUNT');
    configIdentiferGa.query();
    if (configIdentiferGa.next()) {
        var count = Number(configIdentiferGa.getAggregate('COUNT'));
        if (count > 0) {
            gs.addErrorMessage(gs.getMessage("Only one default configuration is allowed"));
            current.setAbortAction(true);
        }
    }
})(current, previous);
