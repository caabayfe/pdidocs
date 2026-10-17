function transform(input){
	if(!input.tableName){
		return {};
	}

	var utils = new sn_wwna.NAAWWNAUtils();
	return utils.fetchColumnToLabelMap(input.tableName);
}
