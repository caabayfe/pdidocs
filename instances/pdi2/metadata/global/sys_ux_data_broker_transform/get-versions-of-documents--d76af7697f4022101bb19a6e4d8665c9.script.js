
       function transform(input) {
	var output = new DocumentComparisionHelper().getListOfVersions(input.tableName,input.targetRecordId);
	return output;
}
