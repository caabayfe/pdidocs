(function executeRule(current, previous /*null when async*/ ) {
    var ON_BUTTON_CLICK_EVENT_TYPE_SYS_ID = '79c06fd5a320311098882dbf36fcda34';
    var ON_LOGIN_EVENT_TYPE_SYS_ID = '4554a173673031107b19b9770cf9223a';
    var source_table = current.source_table;
    var type = current.type;
    var errorMsg;

    if (source_table == 'sys_sg_button') {
        if (type != ON_BUTTON_CLICK_EVENT_TYPE_SYS_ID)
            errorMsg = gs.getMessage('A button can support only OnButtonClick event type.');
    } else if (source_table == 'sys_sg_native_client') {
        if (type != ON_LOGIN_EVENT_TYPE_SYS_ID)
            errorMsg = gs.getMessage('A native client can support only OnLogin event type.');
    } else {
		var supportedSourceTables = ["sys_sg_button", "sys_sg_native_client"];
        errorMsg = gs.getMessage('Source table is invalid. Only {0} or {1} are supported.', supportedSourceTables);
    }

    if (errorMsg) {
        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
