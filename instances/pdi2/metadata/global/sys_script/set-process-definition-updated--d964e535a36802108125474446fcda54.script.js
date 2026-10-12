(function executeRule(current, previous /*null when async*/ ) {
    var variantGR = new GlideRecord('sys_pd_process_variant');
    variantGR.get('sys_id', current.getValue(PDConstants.FIELDS.VARIANT));
    PDUtils.setParentProcessUpdatedOnScheduled(
        variantGR.getValue(PDConstants.FIELDS.PROCESS_DEFINITION),
        current.operation() !== 'delete' && current.getValue(PDConstants.FIELDS.SYS_UPDATED_ON)
    );
})(current, previous);
