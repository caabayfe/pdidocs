writeJFR();

function writeJFR() {
    if (current.canRead() && current.canWrite()) {
        var agentName = current.name.replace(/'/g, "\\'");

        // Send system command
        new MIDServerManage().write_jfr_dump(agentName);

        // reload current form
        action.setRedirectURL(current);
    }
}
