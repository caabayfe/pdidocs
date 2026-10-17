function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	//Hide 'On hold' for states 'New' (-5), 'Closed' (3) and 'Canceled' (4)
	if (oldValue === '-5' ||
		oldValue === '3' ||
		oldValue === '4')
		g_form.setDisplay('on_hold', false);
}
