(function executeRule(current, previous /*null when async*/ ) {
    var value = current.value;
    if (value == 'all' || value == 'elevated') {
        gs.addInfoMessage(gs.getMessage("Use caution when enabling the All and Elevated log levels as they can capture sensitive data such as authorization headers or session cookies. Revert back to the Basic log level after troubleshooting."));
    }
})(current, previous);
