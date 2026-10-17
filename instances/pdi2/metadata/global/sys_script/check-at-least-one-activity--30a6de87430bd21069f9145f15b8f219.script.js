(function executeRule(current, previous /*null when async*/ ) {
    var processTypeActivityMapping = PDUtils.getPlaybookTypeActivities(current.getUniqueValue());

    if (!processTypeActivityMapping.hasNext()) {
        current.setAbortAction(true);
        gs.addInfoMessage(
            gs.getMessage("Select activities for this Playbook type using the related list below.")
        );
    }
})(current, previous);
