(function executeRule(current, previous /*null when async*/) {
	var prevVal = previous.getValue("stores_classic_data") == 1;
	var currVal = current.getValue("stores_classic_data") == 1;
	var currId = current.getUniqueValue();
	if ((!prevVal) && currVal) {
		var gr = new GlideRecord("mb_shard_mapping");
		gr.addQuery("sys_id", "!=", currId);
		gr.setValue("stores_classic_data", false);
		gr.query();
		gr.updateMultiple();
	}
})(current, previous);
