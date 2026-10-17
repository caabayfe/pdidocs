if(selection_result == 'cancel') {
	var gr = new GlideRecord("ast_contract");
    if (gr.get(my_sys_id) && gr.canWrite()) {
		// make all rate cards inactive 
		new ContractManagementUtils().activateRateCards(gr, false);
    	gr.state = 'cancelled';	
		gr.substate = '';
		gr.update();
		var urlOnStack = GlideSession.get().getStack().bottom();
		response.sendRedirect(urlOnStack);
	}
}
