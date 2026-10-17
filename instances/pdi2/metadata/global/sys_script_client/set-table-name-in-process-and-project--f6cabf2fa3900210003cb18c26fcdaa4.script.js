function onLoad() {
   if(!g_scratchpad.rootEntity){
		g_form.setValue('table', g_form.getReference('process_def').table);
	}else{
		g_form.setValue('table', g_scratchpad.rootEntity);
	}	
	
}
