(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

			var queryParams = request.queryParams;
			if(queryParams.userPreferenceKeys){
				var gr = new GlideRecord('sys_user_preference');
				var body = {};
				var keys = queryParams.userPreferenceKeys[0].split(",");
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
						if (gr.canRead()) {
							body[gr.getValue('name')] = gr.getValue('value');
						}
					}
					response.setContentType('application/json');
					response.setStatus(200);
					response.setBody(body);
				}

			}
		})(request, response);
