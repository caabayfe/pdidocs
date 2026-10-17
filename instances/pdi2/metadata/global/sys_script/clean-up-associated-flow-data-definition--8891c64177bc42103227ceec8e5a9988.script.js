(function executeRule(current, previous /*null when async*/) {

    if (PDUtils.getAdditionalFunctionality(current) !== PDConstants.ADDITIONAL_FUNCTIONALITY_TYPE.QUESTIONNAIRE)
        return;

    var dataDefinitionSysId = current.inputs.data_definition;
    return PDUtils.deleteFlowDataDefinition(dataDefinitionSysId);

})(current, previous);
