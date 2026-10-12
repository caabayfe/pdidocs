(function executeRule(current, previous /*null when async*/ ) {
    var associatedObjectsCount = sn_flow_trigger.TriggerUsage.getAssociatedObjectsCount(current);
    if (associatedObjectsCount > 0) {
        gs.addErrorMessage(gs.getMessage('{0} trigger definition is used by <b>{1} Object(s)</b>. A trigger can only be deleted if it is not currently used in any object. This is crucial to maintaining the integrity of ongoing operations.', [current.name, associatedObjectsCount]));
        current.setAbortAction(true);
    }
})(current, previous);
