function onLoad() {
    jQuery(document).ready(function() {
        setTimeout(refreshFieldListPerType, 1500);
    });
}

function refreshFieldListPerType() {
    var fieldType = g_form.getValue("type");
    var findingDefRef = g_form.getReference('finding_def');
    if (findingDefRef && findingDefRef.type == 'PROJECT') {
        if (fieldType == 'CONTEXT') { // show all field options 
            var options = g_form.getOptionControl("field").options;
            for (var cnt = 0; cnt < options.length; cnt++) {
                if (!options[cnt].visible()) {
                    options[cnt].show();
                }
            }
        } else if (fieldType == 'PROPERTY') {
            var entitySysId = g_form.getValue('entity') || '';
            if (entitySysId != '') {
                var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
                gaProminUtil.addParam('sysparm_name', 'getActivityOfInterestList');
                gaProminUtil.addParam('sysparm_tableConfigSysId', entitySysId);
                gaProminUtil.getXMLWait(); // get AD with activity of interest true

                var fieldList = gaProminUtil.getAnswer();
                if (fieldList != null && fieldList.length > 0) {
                    fieldList = fieldList.split(",");
                    var options = g_form.getOptionControl("field").options;
                    for (var cnt = 0; cnt < options.length; cnt++) {
                        if (fieldList.includes(options[cnt].value)) {
                            options[cnt].hide();
                        }
                    }
                }
                if (g_form.getValue("field") == "") {
                    g_form.setValue('field', '');
                }
            }
        }
    }
}
