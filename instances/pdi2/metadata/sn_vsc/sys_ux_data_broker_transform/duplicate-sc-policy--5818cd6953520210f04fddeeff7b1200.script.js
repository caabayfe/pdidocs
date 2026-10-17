function transform(input) {
	if (!input.sys_id) {
		return;
	}
	var util = new sn_vsc.SCSecurityPolicyUtil();
	var id = util.copyPolicyFromID(input.sys_id);
	return id;
}
