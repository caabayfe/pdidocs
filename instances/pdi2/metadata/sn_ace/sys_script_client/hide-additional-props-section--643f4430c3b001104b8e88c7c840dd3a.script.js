function onLoad() {
	//Type appropriate comment here, and begin script below
	var REUSABLE_BLOCK_DEFINITION_SYS_ID = '5db4a12153975110c733ddeeff7b1277';
	if(g_form.isNewRecord() && g_form.getValue('type') != REUSABLE_BLOCK_DEFINITION_SYS_ID ){
		g_form.addInfoMessage('Additional customizations can be added after saving the record');
		g_form.setSectionDisplay('additional_props', false);
	}
}
