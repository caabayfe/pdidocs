(function executeRule(current, previous /*null when async*/) {

	if (current.parent) {
		var provider = new sn_cc.AliasProvider();
		provider.copyConnectionAttributes(current.parent, current.sys_id);
	}

})(current, previous);
