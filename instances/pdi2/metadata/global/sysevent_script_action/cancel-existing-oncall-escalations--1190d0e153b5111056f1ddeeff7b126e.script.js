(function(current, event) {
    new TriggerRule()
        .setRecord(current)
        .cancelWorkflows(event.parm2);
})(current, event);
