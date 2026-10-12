(function executeRule(current, previous /*null when async*/) {
	var badData = false;
	if (current.getRecordClassName() == 'sc_cat_item_producer' || current.getRecordClassName() == 'sc_cat_item_producer_service') {
		if (!current.request_method.nil()) badData = true;
		if (current.no_cart_v2.getValue() == 1) badData = true;
		if (current.no_delivery_time_v2.getValue() == 1) badData = true;
		if (current.no_quantity_v2.getValue() == 1) badData = true;
	}
	else if (current.getRecordClassName() == 'sc_cat_item_guide') {
		if (current.no_wishlist_v2.getValue() == 1) badData = true;
		if (current.no_quantity_v2.getValue() == 1) badData = true;
		if (current.no_attachment_v2.getValue() == 1) badData = true;
		if (current.mandatory_attachment.getValue() == 1) badData = true;
	}
	
	if (current.no_attachment_v2.getValue() == 1 && current.mandatory_attachment.getValue() == 1)
		badData = true;
	
	if (badData) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This is a wrong configuration for {0}", current.getClassDisplayValue()));
	}

})(current, previous);
