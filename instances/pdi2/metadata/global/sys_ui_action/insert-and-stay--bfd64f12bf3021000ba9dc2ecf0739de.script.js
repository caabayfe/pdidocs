doInsertAndStay();
function doInsertAndStay() {
	var saveMe = current;
	var originalSysId = current.getUniqueValue();
	var onMetadataForm = current.getTableName() == "sys_metadata";
	if(onMetadataForm) {
		// get actual record and copy over the changed sys_metadata values
		var gr = new GlideRecord(current.sys_class_name.toString());
		gr.get(current.sys_id.toString());
		var elements = current.getElements();
		var numElements = elements.size();
		for(var i = 0; i < numElements; i++) {
			var element = elements.get(i);
			if(element.changes())
				gr.setValue(element.getName().toString(), current.getValue(element.getName().toString()));
		}
		current = gr;
	}
	if (typeof current.number != 'undefined' && current.number)
		current.number = ""; // generate a new number
	else if (typeof current.u_number != 'undefined' && current.u_number)
		current.u_number = ""; // generate a new number
	current.sys_scope = gs.getCurrentApplicationId();
	if (onMetadataForm) {
        answer = current.insert();
        saveMe = "sys_metadata.do?sysparm_ignore_class=true&sys_id=" + answer;
    } else {
        answer = insertRecord(current);
    }

    var useEsLatest = false;
    var esGr = new GlideRecord('sys_es_latest_script');
    esGr.addQuery('id', originalSysId);
    esGr.addQuery('table', current.getTableName());
    esGr.query();
    if (esGr.next())
        useEsLatest = esGr.getValue('use_es_latest') == true;
    if (useEsLatest) {
        esGr.initialize();
        esGr.id = answer;
        esGr.table = current.getTableName();
        esGr.use_es_latest = true;
        esGr.insert();
    }

	action.setRedirectURL(saveMe);
}
