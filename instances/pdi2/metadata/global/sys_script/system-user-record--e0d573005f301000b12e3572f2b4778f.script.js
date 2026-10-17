(function executeRule(current, previous /*null when async*/ ) {
    if (isSystem(current.getValue("sys_id")) ||
        isSystem(current.getValue("user_name")) ||
        isSystem(current.getValue(current.getDisplayName()))) {

        gs.addErrorMessage(gs.getMessage("You cannot create a SYSTEM user record"));
        current.setAbortAction(true);
        return;
    }

    function isSystem(value) {
        if (!value)
            return false;
        return "system" == value.trim().toLocaleLowerCase();
    }

})(current, previous);
