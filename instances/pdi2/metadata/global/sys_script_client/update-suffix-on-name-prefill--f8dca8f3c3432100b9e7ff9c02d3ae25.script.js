function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!g_form.isNewRecord())
		return;

	if (!isLoading)
		return;
	
    var scope = g_scratchpad.scope;
	scope = scope == 'global' ? '' : scope + '.';
	
	if (scope && newValue.startsWith(scope))
		newValue = newValue.substr(scope.length); //trim scope
	
	if (g_form.getValue('suffix') == newValue)
		return;
	
	setSuffixWithoutOnChange(newValue);
	
	function setSuffixWithoutOnChange(newName) {
		var target = g_form.getControl('suffix');
		var ml = target.maxLength;
		if (newName.length > ml) {
			if (!target.alerted) {
				var msg = new GwtMessage();
				var values = ['Suffixes cannot exceed', 'characters'];
				var answer = msg.getMessages(values);
				alert(answer['Suffixes cannot exceed'] + " " + ml + " " + answer['characters']);
				target.alerted = true;
			}
		} else {
			target.alerted = false;
			target.value = newName;
		}

	}
}
