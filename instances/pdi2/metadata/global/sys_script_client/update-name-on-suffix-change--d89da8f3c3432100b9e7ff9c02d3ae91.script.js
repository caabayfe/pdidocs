function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!newValue && isLoading)
		return;
	
	if (isLoading && oldValue == newValue)
		return;
	
	var scope = g_scratchpad.scope;
	scope = scope == 'global' ? '' : scope + '.';
	
	if (scope && newValue && !newValue.startsWith(scope))
		newValue = scope + newValue;
		
	setNameWithoutOnChange(newValue);
	
	function setNameWithoutOnChange(newName) {
		var target = g_form.getControl('name');
		var ml = target.maxLength;
		if (newName.length > ml) {
			if (!target.alerted) {
				var msg = new GwtMessage();
				var values = ['Names cannot exceed', 'characters'];
				var answer = msg.getMessages(values);
				alert(answer['Names cannot exceed'] + " " + ml + " " + answer['characters']);
				target.alerted = true;
			}
		} else {
			target.alerted = false;
			target.value = newName;
		}

	}
}
