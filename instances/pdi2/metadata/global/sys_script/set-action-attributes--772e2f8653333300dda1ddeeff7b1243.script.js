(function executeRule(current, previous /*null when async*/) {
	var component = current.getValue("ui_component");

	if (!component) {
		current.setValue('action_attributes', '{}');
		return;
	}

	var daUtility  = new DAUtility();
	var attr = daUtility.getComponentAttributes(component);
	var currAttributes = JSON.parse(current.getValue('action_attributes') || '{}');
	var keyPairObj = attr.reduce(function(acc, attr) {
		acc[attr.name] = currAttributes[attr.name] || attr.value || '';
		return acc;
	}, {});

	current.setValue('action_attributes', JSON.stringify(keyPairObj));
})(current, previous);
