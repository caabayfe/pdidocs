function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
       return;
    }
	
	// setOperationsChoices is defined in the Set Operations Choice List on Load Client Script
	g_scratchpad.setOperationChoices(newValue);
}
