(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var message;
	var sysId = request.queryParams.sys_id;
	var entityType = request.queryParams.type;
	var parser = new sn_impex.GlideExcelParser();
	var success = parser.parseFormData(request.body.dataStream);
	var uploadRecipients = {};
	var body = {};
		if(success){
			
				var columnHeaders = parser.getColumnHeaders();
				//body["headers"] = columnHeaders;
				
				//Initialize return object
				for (var i = 0; i < columnHeaders.length; i++) {
					uploadRecipients[columnHeaders[i]] = [];
				}
				var count = 0;
				var firstHeader = columnHeaders[0];
				var searchList = [];
				var showErrMsg = false;
				var validLine;
				
				if (columnHeaders) {
					while(parser.next()) {
						body['row'+count] = parser.getRow();
						var cur = body['row'+count];
						validLine = false;
						for (var j = 0; j < columnHeaders.length; j++) {
							if (columnHeaders[j] && cur != null && !gs.nil(cur[columnHeaders[j]])) {
								uploadRecipients[columnHeaders[j]].push(cur[columnHeaders[j]]+"");
								validLine = true;
							}
						}
						if(validLine)
							count++;
					}
				} else
				showErrMsg = true;
				var res = {};
					var validateMap = new RecipientListUploadProcessor().validateUploadOperation(body, entityType[0],count);
					
					res["totalRecords"] = validateMap["totalRecords"];
					res["validRecords"] = validateMap["validRecords"];
					res["invalidRecords"] = validateMap["invalidRecords"];
					res["validSysIds"] = validateMap["validSysIds"];
					res["recipientm2mTable"] = validateMap["recipientm2mTable"];
					response.setStatus(200);
					response.setBody(res);
				} else {
					message = "Parse Failed : " + parser.getErrorMessage();
					response.setContentType('text/plain');
					response.getStreamWriter().writeString(message);
					response.setStatus(400);
				}
			})(request, response);
