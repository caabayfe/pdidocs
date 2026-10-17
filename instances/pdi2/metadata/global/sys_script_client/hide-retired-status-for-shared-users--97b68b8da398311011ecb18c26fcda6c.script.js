function onLoad() {
  if(g_scratchpad.isSharedProject) {
	if(!g_scratchpad.isProjectRetired){
		g_form.removeOption("status", "RETIRED");
	}
	g_form.setReadOnly('auto_retire',true);
  }
}
