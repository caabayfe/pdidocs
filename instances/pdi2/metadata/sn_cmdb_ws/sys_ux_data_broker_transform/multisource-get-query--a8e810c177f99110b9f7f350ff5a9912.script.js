function transform(input) {
	var util = new sn_cmdb_ws.MultisourceUtil();
	var sys_id = input.sys_id;
	return util.getQuery(sys_id);
}
