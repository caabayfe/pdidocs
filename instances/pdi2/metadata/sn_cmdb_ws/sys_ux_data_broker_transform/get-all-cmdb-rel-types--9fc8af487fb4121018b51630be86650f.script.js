function transform(input) {
    var r = new sn_cmdb_ws.CMDBWsGetRelTypes();
	var res = r.getRelTypes(input.ciClassName);
	return res;
}
