(function executeRule(current, previous /*null when async*/) {

	if (current.parent) {
		var provider = new sn_cc.AliasProvider();
		provider.copyParentAliasFields(current);
	}

})(current, previous);
