function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if ((oldValue != 'CANCELLED' && newValue == 'CANCELLED')) {
        g_navigation.reloadWindow();
    } else if(oldValue != 'ERROR' && newValue == 'ERROR'){
		showMiningTracker();
	}
}
