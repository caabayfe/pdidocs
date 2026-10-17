(function executeRule(current, previous /*null when async*/ ) {

    current.setValue('life_cycle_stage', 'Operational');
    current.setValue('life_cycle_stage_status', 'In Use');

})(current, previous);
