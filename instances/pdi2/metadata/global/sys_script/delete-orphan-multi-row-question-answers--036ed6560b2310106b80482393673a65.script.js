(function executeRule(current, previous /*null when async*/) {
	gs.eventQueue('sc_cart_item.multi_row.orphan.delete', null, current.getUniqueValue());
})(current, previous);
