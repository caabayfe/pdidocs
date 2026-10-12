(function executeRule(current, previous /*null when async*/) {
		var assi = new GlideRecord("sc_item_variable_assignment");
		assi.addQuery("rule", current.getUniqueValue());
		assi.deleteMultiple();
})(current, previous);
