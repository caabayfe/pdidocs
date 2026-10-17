(function executeRule(current, previous /*null when async*/ ) {
    var activityGr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
    activityGr.get(current.getValue(PDConstants.FIELDS.ACTIVITY));
    PDUtils.setParentProcessUpdatedOnScheduled(
        activityGr.getValue(PDConstants.FIELDS.PROCESS_DEFINITION),
        current.operation() !== 'delete' && current.getValue(PDConstants.FIELDS.SYS_UPDATED_ON)
    );
})(current, previous);
