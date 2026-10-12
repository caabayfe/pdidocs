if(hold_or_submit == "submit" || hold_or_submit == "hold"){
    var cm = new GlideRecord("ast_contract");
	var optionString = "";
	if (extension_option.toString() == "1")
		optionString = "1 year";
	if (extension_option.toString() == "2" || extension_option.toString() == "3")
		optionString = extension_option + " years";
	
    if (cm.get(current_sys_id) && cm.canWrite()) {
        cm.renewal_contact=extension_contact;
        cm.renewal_date = start_date;
        cm.renewal_end_date = end_date;
        cm.renewal_options = optionString;
        cm.cost_adjustment_type = cost_type;
        cm.cost_adjustment = cost_adjust;
        cm.cost_adjustment_percentage = cost_percent;
		cm.approver = approver;
        if(hold_or_submit == "submit")
            cm.substate = 'under_review';
        else
            cm.substate = 'awaiting_review';
        cm.process = 'extension';
        cm.update();
    }
}

if(hold_or_submit == "submit" || hold_or_submit == "hold" || hold_or_submit == "cancel") {
    var urlOnStack = GlideSession.get().getStack().bottom();
    response.sendRedirect(urlOnStack);
}
