(function executeRule(current, previous /*null when async*/) {
	if(current.inputs == undefined || current.inputs.http_method == undefined || current.inputs.request_body == undefined)
		return;
	
	if(current.inputs.http_method == 'get' || current.inputs.http_method == 'delete') {
		current.inputs.request_body = '';
		return;
	}
		
	var requestBody = current.inputs.request_body.toString();

	if(requestBody && requestBody.length > 0) {
		// each char is encoded in 16 bits.
		var numOfBytesInBody = requestBody.length * 2;

		//value of property in KB.
		var atfRestPayloadMaxSize = getRequestBodyMaxSize() * 1024;

		if (atfRestPayloadMaxSize >= 0 && numOfBytesInBody > atfRestPayloadMaxSize) {
			var args = [];
			args.push(atfRestPayloadMaxSize);

			var errorMessage = gs.getMessage("Request payload can\'t have more than {0}" +
											" bytes. Use glide.atf.rest.request_payload_max_size to update maximum request payload size.", args);
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
		}
	}
	
	function getRequestBodyMaxSize() {
		var atfRestPayloadMaxSizeInt = 100;
		var sysPropertiesGR = new GlideRecord('sys_properties');
		sysPropertiesGR.addQuery('name', 'glide.atf.rest.request_payload_max_size');
		sysPropertiesGR.query();

		if(sysPropertiesGR.next()) {
			var atfRestPayloadMaxSizeString = sysPropertiesGR.getValue('value');
			atfRestPayloadMaxSizeInt = parseInt(atfRestPayloadMaxSizeString);
			if (atfRestPayloadMaxSizeInt == undefined || atfRestPayloadMaxSizeInt < 0) {
				atfRestPayloadMaxSizeInt = 100;
			} else if (atfRestPayloadMaxSizeInt > 1024) {
				atfRestPayloadMaxSizeInt = 1024;
			}
		}
		return atfRestPayloadMaxSizeInt;
	}
})(current, previous);
