/* 
* find any related application instances with the old name and update them to the new name...
*/

fixNameChange();

function fixNameChange() {
	var old_prefix = previous.name + ''; 
	var new_prefix = current.name + '';  

	var gr = new GlideRecord(current.table);
	gr.addQuery('classifier', current.getUniqueValue());
	gr.query();
	while (gr.next()) {
		var app_name = '' + gr.name;		
		var sep = app_name.indexOf('@');		
		if (sep < 0) //This means there's no name@computer format, don't change it!
			continue;
		
		var old_suffix = app_name.substr(sep);
		gr.name = new_prefix + old_suffix;
		gr.update();
	}
}
