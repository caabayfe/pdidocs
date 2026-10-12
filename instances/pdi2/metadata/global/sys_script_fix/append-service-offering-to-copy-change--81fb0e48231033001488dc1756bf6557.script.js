var svc_offering_table = 'task_service_offering';
var prop_related_list = 'com.snc.change_request.copy.related_lists';
var property = gs.getProperty(prop_related_list);
if (property) {
	var propertyArr = property.split(',');
	if (!new ArrayUtil().contains(propertyArr, svc_offering_table)) {
		propertyArr.push(svc_offering_table);
		gs.setProperty(prop_related_list, propertyArr.join(','));
	}
}
