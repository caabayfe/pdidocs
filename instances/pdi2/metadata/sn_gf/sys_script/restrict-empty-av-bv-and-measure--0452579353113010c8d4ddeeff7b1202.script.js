(function executeRule(current, previous /*null when async*/ ) {


    var measureLabel = current.getElement('measure').getLabel();
    var startValueLabel = current.getElement('base_value').getLabel();
    var finalTargetValueLabel = current.getElement('target_value').getLabel();
    var actualValueLabel = current.getElement('actual_value').getLabel();

    gs.addErrorMessage(gs.getMessage('{0}, {1} and {2} fields are mandatory if {3} is not empty', [measureLabel, startValueLabel, finalTargetValueLabel, actualValueLabel]));
    current.setAbortAction(true);

})(current, previous);
