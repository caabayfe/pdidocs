(function executeRule(current, previous /*null when async*/ ) {
    if (current.prb_model) {
        var problemModel = new ProblemModel(current.prb_model.getRefRecord());

        // Check if we can transition between the states.
        if (!problemModel.canTransition(current, ProblemState.STATES.ASSESS))
            return;
    }

    var reqFields = new ProblemStateUtils().getReqFieldsFromUI('assess_dialog_form_view');
    for (var field in reqFields)
        if (gs.nil(current.getValue(reqFields[field])))
            return;
    current.setValue('problem_state', ProblemState.STATES.ASSESS);
})(current, previous);
