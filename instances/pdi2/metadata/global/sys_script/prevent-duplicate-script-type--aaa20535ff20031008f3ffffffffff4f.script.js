(function executeRule(current, previous) {
    var scriptType = current.configuration_script.type;

    var existing = new GlideRecord('sys_sg_aiux_configuration');
    existing.addQuery('native_client', current.native_client);
    existing.addQuery('configuration_script.type', scriptType);

    if (!current.isNewRecord()) {
        existing.addQuery('sys_id', '!=', current.getUniqueValue());
    }

    existing.setLimit(1);
    existing.query();

    if (existing.next()) {
        gs.addErrorMessage(gs.getMessage('A configuration script of type "{0}" is already linked to native client "{1}".', [scriptType, current.native_client.getDisplayValue()]));
        current.setAbortAction(true);
    }
})(current, previous);
