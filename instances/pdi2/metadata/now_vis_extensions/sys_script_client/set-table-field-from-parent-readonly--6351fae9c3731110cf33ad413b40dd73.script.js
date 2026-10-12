function onLoad() {
   g_form.getReference('parent', getConfig);

    function getConfig(response) { // reference is passed into callback
		if (typeof response.getValue('sys_id') !== 'undefined'){
			g_form.setValue('table',response.getValue('table'));
			
			// set readonly table and parent fields
			g_form.setReadOnly("table",true);
			g_form.setReadOnly("parent",true);
		}
    }
   
}
