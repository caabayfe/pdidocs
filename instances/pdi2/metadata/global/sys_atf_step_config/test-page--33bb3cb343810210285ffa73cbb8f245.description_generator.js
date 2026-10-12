function generateDescription() {
    var action = step.inputs.function_to_call;
    var component = step.inputs.component;
    var inputs = step.inputs.action_parameters;
    var expectedReturn = step.inputs.returns;

    var stepDescription = gs.getMessage("Perform action '{0}' on component '{1}'", [action, component]);
    if (inputs && inputs != '[]')
        stepDescription += gs.getMessage("\nwith parameters: {0}", inputs.toString());
    if (expectedReturn)
        stepDescription += gs.getMessage("\nwith expected return value: {0}", expectedReturn);
    return stepDescription;
}
generateDescription();
