(function executeRule(current, previous) {
    try {
        var sharingInfo = {};
        if (!current.user.nil()) {
            sharingInfo.user = current.user.toString();
        } else if (!current.user_group.nil()) {
            sharingInfo.user_group = current.user_group.toString();
        } else {
            sharingInfo.company = current.global.getDisplayValue() === 'true';
        }

        if (current.operation() === 'insert')
            gs.eventQueue("app_template.shared", current, current.template.sys_id, JSON.stringify(sharingInfo));
        if (current.operation() === 'delete')
            gs.eventQueue("app_template.unshared", null, current.template.sys_id, JSON.stringify(sharingInfo));
            
		
    } catch (ex) {
        gs.addErrorMessage(ex.getMessage());
    }
})(current, previous);
