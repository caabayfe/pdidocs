if(cancel_or_submit == "submit" && error == "false") {
var contract = new GlideRecord("ast_contract");
    if (contract.get(contract_sys_id) && contract.canWrite()) {
        contract.starts=contract_starts;
        contract.ends = contract_ends;
        contract.payment_amount = contract_payment;
		contract.update();
    }

if(hasRateCard) {
	for(var i=0 ; i< rowCount; i++) {
		var sys = eval("rate_card_sysId_" + i);
		var name = eval("rate_card_name_" + i);
		var cost = eval("rate_card_cost_" + i);
		var start = eval("rate_card_start_" + i);
		var end = eval("rate_card_end_" + i);
		
		var record = new GlideRecord("fm_contract_rate_card");
		if(record.get(sys) && record.canWrite()) {
			record.name = name;
			record.base_cost = cost;
			record.start_date = start;
			record.end_date = end;
			record.update();
		}
	}
}
var urlOnStack = GlideSession.get().getStack().bottom();
response.sendRedirect(urlOnStack);
}
