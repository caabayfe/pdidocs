function onLoad() {
  var name = g_form.getControl('export_set');
  if(name !== null)
	  name.placeholder = getMessage("Enter a name for this Export Set");
	
  var filePath = g_form.getControl('file_path');
  if(filePath !== null)
	  filePath.placeholder = getMessage("Enter a path relative to {MID Server Installation Directory}/export");	
}
