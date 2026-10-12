(function executeRule(current, previous /*null when async*/) {

	var fieldsToTrim = ["connection_url", "protocol", "host", "port", "base_path"];
	for (var i = 0; i < fieldsToTrim.length; i++) {
		trimField(current, fieldsToTrim[i]);
	}

})(current, previous);


function trimField(current, fieldName) {

	var fieldValue = current.getValue(fieldName);

	//Check if field is set
	if(!gs.nil(fieldValue)) {
		var trimmedValue = fieldValue.replace(/\s+/g, '');
		current[fieldName] = trimmedValue;
	}

}
