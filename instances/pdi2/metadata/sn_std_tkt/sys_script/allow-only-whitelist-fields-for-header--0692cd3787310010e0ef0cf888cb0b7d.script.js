(function executeRule(current, previous /*null when async*/) {
	
	var notAllowedFields = "number,short_description,sys_created_on,sys_updated_on,	sys_mod_count,state,watch_list,comments,comments_and_work_notes,work_notes,work_notes_list,user_input";
	notAllowedFields = notAllowedFields.replace(/\s/g,'');
	notAllowedFields = notAllowedFields.split(',');
	var infoFields = current.info_fields + '';
	infoFields = infoFields.split(',');
	var notAllowedConfigFields = [];
	for(var i=0; i < infoFields.length; i++) {
		var notAllowedField = infoFields[i];
		if (notAllowedFields.indexOf(notAllowedField) >= 0)
			notAllowedConfigFields.push(notAllowedField);
	}
	if (notAllowedConfigFields.length > 0) {
        current.setAbortAction(true);
        var resFields = [];
        var gr = new GlideRecord(current.table);
        for (var j = 0; j < notAllowedConfigFields.length; j++)
            resFields.push(gr.getElement(notAllowedConfigFields[j]).getED().getLabel());
        gs.addErrorMessage(gs.getMessage("The following fields '{0}' are not allowed in info region", resFields.join(', ')));
    }
})(current, previous);
