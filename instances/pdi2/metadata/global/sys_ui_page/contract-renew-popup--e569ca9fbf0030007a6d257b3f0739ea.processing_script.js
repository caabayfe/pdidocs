if((start_error == "false" ) && (end_error == "false" ) && (hold_or_submit == "submit" || hold_or_submit == "hold")){
    var cm = new GlideRecord("ast_contract");
		var optionString = "";
	if (renew_option.toString() == "1")
		optionString = "1 year";
	if (renew_option.toString() == "2" || renew_option.toString() == "3")
		optionString = renew_option + " years";

    if (cm.get(current_sys_id) && cm.canWrite()) {
        cm.renewal_date = start_date;
        cm.renewal_end_date = end_date;
        cm.renewal_options = optionString;
        cm.cost_adjustment_type = cost_type;
        cm.cost_adjustment = cost_adjust.replaceAll(GlideLocale.get().getGroupingSeparator(), '').replaceAll(GlideLocale.get().getDecimalSeparator(), '.');
        cm.cost_adjustment_percentage = cost_percent.replaceAll(GlideLocale.get().getGroupingSeparator(), '').replaceAll(GlideLocale.get().getDecimalSeparator(), '.');
		cm.approver = approver;
        if(hold_or_submit == "submit")
            cm.substate = 'under_review';
        else
            cm.substate = 'awaiting_review';
        cm.process = 'renewal';
        cm.update();
    }
}

if(hold_or_submit == "submit" || hold_or_submit == "hold") {
    var urlOnStack = GlideSession.get().getStack().bottom();
    response.sendRedirect(urlOnStack);
}
