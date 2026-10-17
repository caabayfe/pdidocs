function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   var name = g_form.getValue('name');
   // If name is already set, we don't change it automatically here.
   if (name && name != '' && !g_form.isNewRecord()) {
      return;
   }
   
   var newName = createTableNameFromLabel(newValue);
   g_form.setValue('name', newName);
}

function createTableNameFromLabel(label) {
	var hierarchy = label.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	// Compact any multiple sequential underscores
	while (hierarchy.indexOf("__") != -1) {
		hierarchy = hierarchy.replace(/__/g, "_");
	}

	// Replace any trailing underscores
	while (hierarchy != '' && hierarchy.charAt(hierarchy.length - 1) == '_') {
		hierarchy = hierarchy.substring(0, hierarchy.length - 1);
	}

	return hierarchy;
}
