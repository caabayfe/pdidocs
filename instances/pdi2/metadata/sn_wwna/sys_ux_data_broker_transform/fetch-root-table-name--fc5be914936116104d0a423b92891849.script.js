function transform(input){
	if(!input.tableName){
		return [];
	}
	var utils = new sn_wwna.WWNAUtils();
	var tables = utils._getRootTableFromHierarchy(input.tableName, true);
	return tables;
}
