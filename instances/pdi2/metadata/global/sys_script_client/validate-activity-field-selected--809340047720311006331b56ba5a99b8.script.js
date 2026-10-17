function onSubmit() {
    var dateTimeFields = [];
    var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
    gaProminUtil.addParam('sysparm_name', 'getDateTimeFieldList');
    gaProminUtil.addParam('sysparm_tableName', g_form.getReference('entity').table);
    gaProminUtil.getXMLWait();
    var fieldList = gaProminUtil.getAnswer();

    if (fieldList != null && fieldList.length > 0) {
        dateTimeFields = fieldList.split(",");
        var type = g_form.getValue("type");
        var field = g_form.getValue("field").split('.');
		var isDateTimeField = false;
		for(var count = 0; count < field.length; count++){
            if(dateTimeFields.includes(field[count])){
				isDateTimeField = true;
			}
		}
        if (type != 'DATE_TIME' && isDateTimeField) {
            g_form.addErrorMessage(getMessage("Selected field is not compatible with Type 'Field Values(Default)'. Please either select Date Time from Type or choose non Date Time field."));
            return false;
        } else if (type == 'DATE_TIME' && !isDateTimeField) {
            g_form.addErrorMessage(getMessage("Selected field is not compatible with Type 'Date Time'. Please select field of Date Time type."));
            return false;
        }
    }

}
