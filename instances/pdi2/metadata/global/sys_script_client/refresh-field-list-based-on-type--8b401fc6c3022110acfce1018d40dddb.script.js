function onLoad() {
	showLoadingDialog(); //do not allow users to view the field drop down until the date/time fields are hidden for default type
    jQuery(document).ready(function() {
        setTimeout(refreshActivityFieldListPerType, 1500); 
    }); 
}
function refreshActivityFieldListPerType() {
    var allTables = '',
        dateTimeFields = [];
    var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
    gaProminUtil.addParam('sysparm_name', 'getDateTimeFieldList');
    gaProminUtil.addParam('sysparm_tableName', g_form.getReference('entity').table);
    gaProminUtil.getXMLWait();
    var fieldList = gaProminUtil.getAnswer();

    if (fieldList != null && fieldList.length > 0) {
        dateTimeFields = fieldList.split(",");
		var type = g_form.getValue("type");
		var options = g_form.getOptionControl("field").options;
        if (type == "DATE_TIME") { // show all date time field options 
            for (var cnt = 0; cnt < options.length; cnt++) {
                if (dateTimeFields.includes(options[cnt].value)) {
                    options[cnt].show();
                } else {
                    options[cnt].hide();
                }
            }
        } else if(type == "DEFAULT") {
            for (cnt = 0; cnt < options.length; cnt++) {
                if (dateTimeFields.includes(options[cnt].value)) {
                    options[cnt].hide();
                } else {
                    options[cnt].show();
                }
            }		
		}
    }
	hideLoadingDialog();
}
