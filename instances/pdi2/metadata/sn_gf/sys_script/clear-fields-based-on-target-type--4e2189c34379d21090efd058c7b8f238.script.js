(function executeRule(current, previous /*null when async*/ ) {
    if ((current.type == 'milestone') && (current.target_value || current.actual_value || current.base_value)) {
        current.setValue('target_value', "");
        current.setValue('base_value', "");
        current.setValue('actual_value', "");
    } else if((current.type != 'milestone') && (!!(current.qualitative_target_value || current.qualitative_base_value || current.qualitative_actual_value))) {
        current.setValue('qualitative_target_value', "");
        current.setValue('qualitative_base_value', "");
        current.setValue('qualitative_actual_value', "");
    }
})(current, previous);
