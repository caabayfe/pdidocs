(function executeRule(current, previous /*null when async*/ ) {
    var type = current.type;
    if (type != null && type.toString().length > 0) {
        g_scratchpad.action_type = type;
        g_scratchpad.make_type_read_only = true;
    } else {
        g_scratchpad.make_type_read_only = false;
    }
})(current, previous);
