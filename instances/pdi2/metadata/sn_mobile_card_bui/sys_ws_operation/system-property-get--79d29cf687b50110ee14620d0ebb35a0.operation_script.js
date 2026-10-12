(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var queryParams = request.queryParams;
	if(queryParams.keys){
		var gr = new GlideRecord('sys_properties');
		var body = {};
		var keys = queryParams.keys[0].split(',');
		var encodedQuery = "";
		var keyLength = keys.length;
		if(keyLength>0){
			for (var i = 0; i<keyLength-1; i++) {
				encodedQuery = encodedQuery.concat("name=").concat(keys[i]).concat("^OR");
			}
			encodedQuery = encodedQuery.concat("name=").concat(keys[keyLength-1]);
			gr.addEncodedQuery(encodedQuery);
			gr.query();
			while (gr.next()) {
				// "glide.ui.polaris.experience" is not owned by MCB and we can not manualy change the permission role
				// So we include the boolean check in this result set only for MCB users with roll access of Mobile Card Builder API
				if (gr.canRead() || gr.getValue('name') === "glide.ui.polaris.experience") {
					body[gr.getValue('name')] = gr.getValue('value');
				}
			}
			response.setContentType('application/json');
			response.setStatus(200);
			response.setBody(body);
		}

	}
})(request, response);
