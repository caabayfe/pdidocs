(function executeRule(current, previous /*null when async*/) {
	var requestItem = current.getValue("request_item");
	if (JSUtil.notNil(requestItem))
		current.setValue("parent", requestItem);
})(current, previous);
