function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    //Clear Life Cycle Stage Status field
    var lifeCycleStageStatus = g_form.getValue('life_cycle_stage_status');
    if (lifeCycleStageStatus) g_form.setValue('life_cycle_stage_status', '');
}
