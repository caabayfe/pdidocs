produce();

function produce() {
	// Make sure the script name is valid:
	//    contains only alphanumerics or underscore
	// Additionally, since we invoke the extensions as javascript objects; the name must conform to
	// javascript variable identifier rules:
	//    must start with a letter (a-z or A-Z), underscore (_), or dollar sign ($); 
	//    subsequent characters can also be digits (0-9).
	if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(producer.script_name)) {
		gs.addErrorMessage(gs.getMessage("Extension script name must start with a letter or underscore followed by any valid alphanumeric (a-z, A-Z, 0-9, _)"));
		current.setAbortAction(true);
		return;
	}
	
	// Make sure the script name is unique:
	var scr = GlideRecordSecure('sys_script_include');
	scr.addQuery('name', producer.script_name);
	scr.query();
	if (scr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("A script with this name already exists. If you want to edit an existing script, use the 'Extension scripts' menu."));
		current.setAbortAction(true);
		return;
	}

	// Make sure the category is valid:
	var ext = new GlideRecordSecure('pwd_extension_type');
	ext.addQuery('category', producer.script_category);
	ext.query();
	if (!ext.next()) {
		gs.addErrorMessage(gs.getMessage("Select a valid category"));
		current.setAbortAction(true);
		return;
	}
	
	// Produce the script
	current.name = producer.script_name;
	current.description = ext.description;
	current.script = ext.template.replace(/__scriptName/g, producer.script_name).replace(/__scriptCategory/g, producer.script_category);
}
