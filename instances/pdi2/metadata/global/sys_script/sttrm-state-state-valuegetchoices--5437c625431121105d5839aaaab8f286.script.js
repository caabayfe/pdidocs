function sttrm_state_state_valueGetChoices() {
    if (!current || current.geTableName() + "" === "" || !current.sttrm_model)
        return;
    var model = new STTRMModel(current.sttrm_model.getRefRecord());
    var availableChoices = model.getAvailableStateChoices(current.getValue("state_value"));
    for (var i = 0; i < availableChoices.length; i++)
        answer.add(availableChoices[i].value, availableChoices[i].label);
}
