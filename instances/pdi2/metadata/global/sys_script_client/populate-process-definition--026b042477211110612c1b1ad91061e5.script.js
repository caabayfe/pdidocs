function onLoad() {
	;
   if (!g_form.isNewRecord() || g_form.getValue('lane' == '')) return;
	
	var laneRecord = g_form.getReference('lane', getAndSetProcessDefinition);

    function getAndSetProcessDefinition(gr) {
        if (gr) 
            g_form.setValue('process_definition', gr.getValue('process_definition')); 
    }
}
