function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   //sets the name from the label if no name exists by snake-casing and lowercasing the label
   //they are loading the page or cleared the label, don't do anything
   if (isLoading || newValue === '') {
      return;
   }
	
	//the label is the same as when the page loaded, don't do anything
	if (newValue == oldValue)
		return;
	
	//the name already exists,, don't do anything
	if (g_form.getValue('name') != null && g_form.getValue('name') != '')
		return;

	//they have changed to a new label (or set it for the first time) so make the name and set it
	var newName = makeName(newValue);
	if (newName != null && newName != '')
		g_form.setValue('name', newName);
   
   function makeName(label) {
	if (label == null || label == '')
		return null;

	//force it to a string
	var name = label + '';
	//replace spaces with underscores
	name = name.replaceAll(' ', '_');
	//replace multiple-underscores
	name = name.replaceAll(new RegExp("_{2,}", "g"), '_');
	//lowercase it
	name = name.toLowerCase();

	if (name != null && name.length > 0)
		return name;
	
	return null;
   }
}
