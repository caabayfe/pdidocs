(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	
	var grs = new GlideRecordSecure("svc_by_tags_service_family_categories_m2m");
	grs.addQuery("service_family", queryParams.service_family);
	grs.query();
	
	while(grs.hasNext()){
		grs.next();
		var category = {};
		var categoryGlideRecord = new GlideRecordSecure("svc_tag_categories");
        categoryGlideRecord.addQuery("sys_id", grs.getValue("category"));
        categoryGlideRecord.query();
		
		while (categoryGlideRecord.next()) {
			category.category = categoryGlideRecord.getValue("name");
        }
        category.values = grs.getValue("values");
        result.push(category);
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
