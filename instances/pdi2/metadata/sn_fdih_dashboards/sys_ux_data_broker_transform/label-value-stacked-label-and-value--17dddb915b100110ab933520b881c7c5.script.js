function transform(input) {
    var label = input.label;
	var value = input.value;
	
	if (Array.isArray(value)) {
		var obj = value[0];
		var key = Object.keys(obj)[0];
		value = obj[key];
	}

	var response = [{"label":label,"value":{"type":"string","value":value}}];

    return response;
}
