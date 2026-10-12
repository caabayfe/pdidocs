(function executeRule(current, previous /*null when async*/) {
	if (!current.label)
		return;
	
	var strippedLabel = current.label.toString().replace(/<\/?[^>]+(>|$)/g, "");
	current.label = strippedLabel;
})(current, previous);
