if ((current.getValue('parent') != null)) {
	action.setRedirectURL(current);
	var provider = new sn_cc.AliasProvider();
	provider.syncChildFromParent(current.sys_id);
}
