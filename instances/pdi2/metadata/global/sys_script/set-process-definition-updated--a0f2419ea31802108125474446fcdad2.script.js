(function executeRule(current, previous /*null when async*/ ) {
    PDUtils.setParentProcessUpdatedOnScheduled(
        current.getValue(PDConstants.FIELDS.PROCESS_DEFINITION),
        current.operation() !== 'delete' && current.getValue(PDConstants.FIELDS.SYS_UPDATED_ON)
    );
})(current, previous);
