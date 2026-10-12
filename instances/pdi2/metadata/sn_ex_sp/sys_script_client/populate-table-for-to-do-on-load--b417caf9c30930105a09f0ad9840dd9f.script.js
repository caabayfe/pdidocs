function onLoad() {
   g_form.getReference('todo_config', getConfig);

    function getConfig(response) { // reference is passed into callback
		g_form.setValue('table',response.getValue('table'));
    }
   
}
