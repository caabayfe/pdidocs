function dropColumn () {
  gs.print("Dropping the choice column 'menu' from 'sys_polaris_menu_config'.");
  gs.dropColumn('sys_polaris_menu_config', 'menu');
}

function renameTableDisplayName(){
	gs.print("Renaming the display value of sys_polaris_menu_config table");
	var gr = new GlideRecord("sys_db_object");
	gr.addQuery("name","sys_polaris_menu_config");
	gr.query();
	
	if(gr.next()){
		gr.label = "Unified Navigation Menu";
		gr.update();
	}
}

dropColumn();
renameTableDisplayName();
