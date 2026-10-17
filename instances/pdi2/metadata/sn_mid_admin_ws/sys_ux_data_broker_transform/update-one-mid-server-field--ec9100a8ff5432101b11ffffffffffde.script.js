function transform(input) {
	var result = {
		"updated_record" : input.midSysId,
		"update_status"  : "successfull"
	};
	var gr = new GlideRecord('ecc_agent');
	gr.addQuery('sys_id', input.midSysId);
	gr.query();
	if(gr.next()) {
		gr.setValue(input.fieldName,input.fieldValue);
		gr.update();
	} else {
		result.update_status = "failed";
	}
	return result;
}
