(function executeRule(current, previous /*null when async*/ ) {

    if (current.qualitative_actual_value) {
        current.setAbortAction(true);

        var startValueLabel = current.getElement('qualitative_base_value').getLabel();
        var finalTargetValueLabel = current.getElement('qualitative_target_value').getLabel();
        var actualValueLabel = current.getElement('qualitative_actual_value').getLabel();

        let changedValueLabel = current.qualitative_base_value.changes() ? startValueLabel : finalTargetValueLabel;
        gs.addErrorMessage(gs.getMessage("Cannot set {0} to 'None' when {1} is present.", [changedValueLabel, actualValueLabel]));
    }
})(current, previous);
