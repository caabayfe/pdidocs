function transform(input) {
	var reqMgmtGr = new GlideRecord(input.table); //we can re-use this same transform for sc_request, sc_req_item, and sc_task
	if (reqMgmtGr.get(input.sysId) && reqMgmtGr.canRead()) {
		if (input.table == 'sc_request') {
			var reqInfo = new RequestInfo(reqMgmtGr);
			return reqInfo.getRecordInfo();
		} else if (input.table == 'sc_req_item') {
			var ritmInfo = new RequestedItemInfo(reqMgmtGr);
			return ritmInfo.getRecordInfo();
		} else {
			var scTaskInfo = new CatalogTaskInfo(reqMgmtGr);
			return scTaskInfo.getRecordInfo();
		}
	}
	return {};
}
