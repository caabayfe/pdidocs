(function executeRule(current, previous /*null when async*/ ) {
    var model = new STTRMModel(current.sttrm_model.getRefRecord());
    var choices = model.getAvailableStateChoices(current.getValue("state_value"));

    choices.some(function(choice) {
        if (current.getValue("state_value") === choice.value) {
            current.setValue("state_label", choice.label);
            if (current.state_sequence.nil())
                current.setValue("state_sequence", choice.sequence);
            return true;
        }
    });
})(current, previous);
