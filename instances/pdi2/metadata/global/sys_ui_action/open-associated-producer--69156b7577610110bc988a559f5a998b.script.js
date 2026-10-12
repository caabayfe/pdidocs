var producerID = current.getValue('producer');
if (GlideStringUtil.isEligibleSysID(producerID)) {
	var type = current.getValue("type");
	if (type == 'crp')
		action.setRedirectURL("sc_cat_item_composite_producer.do?sys_id=" + producerID);

	else if (type == 'rp')
		action.setRedirectURL("sc_cat_item_producer.do?sys_id=" + producerID);

} else {
	gs.addErrorMessage(gs.getMessage("No producer is attached to the wizard"));
	action.setRedirectURL(current);
}
