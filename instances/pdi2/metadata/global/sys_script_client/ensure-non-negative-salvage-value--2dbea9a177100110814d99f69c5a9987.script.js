function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	// Salvage value should be positive
	var salvage = newValue.split(';');
	if (parseFloat(salvage[1]) < 0) {
		g_form.setValue('salvage_value', salvage[0] + ';' + 0.00);
		g_form.showFieldMsg('salvage_value', getMessage('Salvage value should be positive'), 'error');
	}
}
