(function executeRule(current, previous /*null when async*/) {

	var adapterCard = current.getValue('adapter_card');
	var channel = current.getValue('channel');
	
	if (gs.nil(adapterCard) || gs.nil(channel) || !current.active)
		return;
	
	var templateGr = new GlideRecord(current.getTableName());
	templateGr.addQuery('adapter_card', adapterCard);
	templateGr.addQuery('channel', channel);
	templateGr.addActiveQuery();
	templateGr.query();
	
	if (templateGr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('There is already an active template for this card and channel'));
		current.setAbortAction(true);
	}

})(current, previous);
