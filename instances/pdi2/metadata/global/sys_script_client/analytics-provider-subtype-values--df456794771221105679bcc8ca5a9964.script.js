function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		removeSubtypesForLoading(oldValue);
		return;
	}

	function removeSubtypesForLoading(type) {
		if (type === 'country') {
			g_form.removeOption('sub_type', '');
		} else if (type === 'policy') {
			g_form.removeOption('sub_type', '');
			g_form.removeOption('sub_type', 'geo-ip');
			g_form.removeOption('sub_type', 'user-country');
		}
	}

	handleSubtypeForChanging(newValue);

	function addCountrySubtypes() {
		g_form.addOption('sub_type', 'geo-ip', 'GeoIP');
		g_form.addOption('sub_type', 'user-country', 'User Country');
		g_form.addOption('sub_type', 'script', 'Script');
	}

	function addPolicySubtypes() {
		g_form.addOption('sub_type', 'script', 'Script');
	}

	// On change we need to only add valid options so onChange for subtype will be triggered correctly
	function handleSubtypeForChanging(type) {
		g_form.clearOptions('sub_type');
		if (type === 'country') {
			addCountrySubtypes();
		} else if (type === 'policy') {
			addPolicySubtypes();
		}
	}
}
