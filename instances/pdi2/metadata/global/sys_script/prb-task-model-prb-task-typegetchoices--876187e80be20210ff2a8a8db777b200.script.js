function prb_task_model_prb_task_typeGetChoices() {
    var availableChoices = ProblemTaskModel.getProblemTaskTypeChoices();
    for (var i = 0; i < availableChoices.length; i++)
        answer.add(availableChoices[i].value, availableChoices[i].label);
}
