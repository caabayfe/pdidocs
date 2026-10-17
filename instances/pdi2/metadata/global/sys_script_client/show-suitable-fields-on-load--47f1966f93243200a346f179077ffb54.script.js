function onLoad() {
   if (g_form.getValue('type') == 1) { //instance type
	   g_form.setDisplay('mid_server_script_include', false);
	   g_form.setDisplay('mid_server_script_include.script', false);
   } else { //mid type
	   g_form.setVisible('active', false);
	   g_form.setVisible('order', false);
	   g_form.setVisible('active', false);
	   g_form.setVisible('source', false);
	   g_form.setDisplay('script', false);
	   g_form.setMandatory('mid_server_script_include', true);
	   g_form.setDisplay('mid_server_script_include', true);
	   g_form.setReadonly('header_name', true);
	   g_form.setReadonly('header_value', true);
	   
	   if (g_form.getValue('mid_server_script_include') != "") {
 			var scriptName = g_form.getReference('mid_server_script_include').name;
 			if (scriptName.startsWith("Transform")) {
				g_form.setDisplay('mid_server_script_include.script', true);
			}
		}
   }
}
