function transform(input) {
	var output = {};
	var table = input.table;
	var sysId = input.sysId;
	if(table) {
		var grObj = new GlideRecord(table);
		if(sysId) {
			grObj.get(sysId);
		}
		output.canRead = grObj.canRead();
		output.canWrite = grObj.canWrite();
		output.canCreate = grObj.canCreate();
		output.canDelete = grObj.canDelete();
	}
	return output;
}
