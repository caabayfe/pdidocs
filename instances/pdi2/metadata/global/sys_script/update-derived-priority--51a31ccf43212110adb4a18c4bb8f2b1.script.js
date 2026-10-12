(function executeRule(current, previous) {
    // Affected sysevent record's derived priority will be updated.
    new SNC.SysEventDerivedPriority().updateDerivedPriority(current.getValue('event_name'));
})(current, previous);
