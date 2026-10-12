function transform(input) {
	var displayValue = input.prop_value;
	if (input.choices) {
		var keyMap = getChoices(input.choices);
		//var keyMap = {};
		displayValue = keyMap[displayValue];
	}
	
	return [
    {"label":input.title,
    "value":[
      {"type":"string","value":displayValue}
    ]}
  ];
	
	
	function getChoices(choices) {
		var keyMap = {};
		var items = choices.split(', ');
		for (var i=0; i<items.length; i++) {
			var item = items[i].split('=');
			keyMap[item[1]] = item[0];
		}
		return keyMap;
	}
}
