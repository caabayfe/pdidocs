function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === ''  || !g_form.isNewRecord()) {
      return;
   }

   g_form.setValue("name", getName(newValue));
}

function getName(newValue) {
	var name = newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	while (name.indexOf("__") != -1) {
		name = name.replace(/__/g, "_");
	}

	// Replace any trailing underscores
	while (name != '' && name.charAt(name.length - 1) == '_') {
		name = name.substring(0, name.length - 1);
	}

	return name;
}
