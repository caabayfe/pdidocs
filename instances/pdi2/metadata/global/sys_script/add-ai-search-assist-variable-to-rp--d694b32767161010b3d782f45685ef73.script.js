(function executeRule(current, previous /*null when async*/) {
	new global.AISARecordProducerUtils().addToRecordProducer(current);
	gs.addInfoMessage(gs.getMessage("The AI Search Assist variable has been added to the '{0}' Record Producer", current.sc_cat_item.name));
})(current, previous);
