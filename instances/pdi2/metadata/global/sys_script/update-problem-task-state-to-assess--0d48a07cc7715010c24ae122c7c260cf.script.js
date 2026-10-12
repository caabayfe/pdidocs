(function executeRule(current, previous /*null when async*/ ) {
    if (current.prb_task_model) {
        var pTaskModel = new ProblemTaskModel(current.prb_task_model.getRefRecord());

        // Check if we can transition between the states.
        if (!pTaskModel.canTransition(current, ProblemTaskState.States.ASSESS))
            return;
    }

    var reqFields = new ProblemStateUtils().getReqFieldsFromUI('ptask_assess_dialog_view');
    for (var field in reqFields)
        if (gs.nil(current.getValue(reqFields[field])))
            return;
    current.setValue('state', ProblemTaskState.States.ASSESS);
})(current, previous);
