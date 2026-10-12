startAgentRecording();

function startAgentRecording() {
    if (current.name.canWrite() && current.jfr_rec_state.canWrite()) {
        var agentName = current.name.replace(/'/g, "\\'");

        // Update jfr_rec_state to hide this UI Action
        current.jfr_rec_state = "STARTING";
        current.update();

        // Send system command
        new MIDServerManage().start_jfr_rec(agentName, '../midserver.jfr');

        // reload current form
        action.setRedirectURL(current);
    }
}
