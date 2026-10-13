(function executeRule(current, previous /*null when async*/ ) {
    var type = current.type;
    var rec = new GlideRecord('sn_ci_analytics_event');
    rec.addQuery('type', type);
    rec.addQuery('active', 'true');
	if (!current.isNewRecord())
        rec.addQuery('sys_id', "!=", current.getValue('sys_id'));
    if (type == 'Custom') {
        if (current.custom_name == true)
            return;
        rec.addQuery('name', current.name.trim());
    }
    
    rec.query();
    if (rec.next()) {
        current.setAbortAction(true);
        var CUSTOM_MSG = gs.getMessage("We found an existing event with the same name. Please choose another name.");
        var OOB_MSG = gs.getMessage("We found an existing event with the same type. Please choose another type.");
        var errMsg = type == 'Custom' ? CUSTOM_MSG : OOB_MSG;
        gs.addErrorMessage(errMsg);
    }
})(current, previous);
