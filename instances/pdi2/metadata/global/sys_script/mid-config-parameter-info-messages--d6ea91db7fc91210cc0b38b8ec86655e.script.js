(function executeRule(current, previous /*null when async*/ ) {
    var param = current.param_name.toString();
    var value = current.value.toString();
    var msg;
    switch (param) {
        case 'mid.jmx.enabled':
            if (value == 'false')
                return;
            msg = gs.getMessage("MID Server JMX Enabled");
            break;
        default:
            return;
    }
    gs.addInfoMessage(msg);
})(current, previous);
