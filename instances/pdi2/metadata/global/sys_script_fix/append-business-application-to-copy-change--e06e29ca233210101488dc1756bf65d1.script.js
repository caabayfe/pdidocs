var businessAppTable = 'task_cmdb_ci_business_app';
var propRelatedList = 'com.snc.change_request.copy.related_lists';
var property = gs.getProperty(propRelatedList);
if (property) {
	var propertyArr = property.split(',');
	if (!new ArrayUtil().contains(propertyArr, businessAppTable)) {
		propertyArr.push(businessAppTable);
		gs.setProperty(propRelatedList, propertyArr.join(','));
	}
}
