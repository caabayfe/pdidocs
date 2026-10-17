function() {
    var inputsLength = vaInputs.inputs.getValue().length;
    var index, key, value;
    var definition = vaInputs.definition.getValue();
    for (index = 0; index < inputsLength; index++) {
        var key = '{{' + index + '}}';
        var value = vaInputs.inputs.getValue()[index];
        definition = definition.replace(key, value);
    }
    return JSON.parse(definition);
}
