(function executeRule(current, previous /*null when async*/) {
	var utils = new global.AISARecordProducerUtils();
	
	function deleteFunc(gr) {
		if (utils.removeFromRecordProducer(gr))
			gs.addInfoMessage(gs.getMessage("The AI Search Assist variable has been removed from the '{0}' Record Producer", current.sc_cat_item.name));
	}
	
	if (current.operation() == "delete") {
		deleteFunc(current);
	} else if (current.operation() == "update" && current.sc_cat_item.changes()) {
		deleteFunc(previous);
		utils.addToRecordProducer(current);
	}
	
})(current, previous);
