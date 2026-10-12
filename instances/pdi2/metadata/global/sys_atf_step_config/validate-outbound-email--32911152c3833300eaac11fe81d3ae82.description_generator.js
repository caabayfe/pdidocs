(function generateDescription(step) {
    var descriptionGenerator = new ATFStepDescriptionGenerator();
    var description;
    var conditions = step.inputs.conditions;
    if (conditions == '' || conditions == '^EQ')
        description = gs.getMessage("Validate that an email was generated.");
    else
        description = gs.getMessage("Validate that an email was generated matching query:\n{0}",
			[descriptionGenerator.getConditionDescription('sys_email', step.inputs.conditions)]);
    description += descriptionGenerator.getTimeoutDescription(step.timeout);
    return description;

})(step);
