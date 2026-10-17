function onLoad() {
	removeRelatedLists();
}

function removeRelatedLists(){
	if (g_form.getIntValue('kb_version') == 2){
	   g_form.hideRelatedList('kb_uc_can_read_mtom');
	   g_form.hideRelatedList('kb_uc_cannot_read_mtom');
	   g_form.hideRelatedList('kb_uc_can_contribute_mtom');
	   g_form.hideRelatedList('kb_uc_cannot_contribute_mtom');  
	   g_form.hideRelatedList('REL:b3b6690aff7121003f07ffffffffffa9');    
	}
}
