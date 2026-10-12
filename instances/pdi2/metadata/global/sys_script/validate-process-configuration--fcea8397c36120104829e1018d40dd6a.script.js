(function executeRule(current, previous /*null when async*/ ) {

    var processConfigUtil = new global.ProminProcessConfigUtil();
	var recordUtil = GlideScriptRecordUtil.get(current);

	//Validate that table is valid
	var grTable = new GlideRecord(current.table);
	if(!grTable.isValid()) {
		gs.addErrorMessage(gs.getMessage("Table {0} is not valid", [current.table]));
        current.setAbortAction(true);
		return;
	}

    //Validate breakdown classification fields limit
	var classificationFields = current.getValue("classification_fields");
    if (!processConfigUtil.isFieldCountValid(classificationFields, 10)) {
        gs.addErrorMessage(gs.getMessage("Max {0} fields representing classification of records are allowed", [10]));
        current.setAbortAction(true);
		return;
    }

    //Validate classification fields have allowed level of dot walking
    if (!gs.nil(current.getValue("classification_fields"))) {
        var fields = current.getValue("classification_fields").split(",");
        for (var index = 0; index < fields.length; index++) {
            var limit = gs.getProperty("promin.limit.breakdown_dot_walk", 3);
            if (!processConfigUtil.isDotWalkLevelValid(fields[index], limit)) {
                gs.addErrorMessage(gs.getMessage("Max {0} levels of dot walk is allowed for classification fields", [limit]));
                current.setAbortAction(true);
                return;
            }
        }
    }

    //Validate there are no duplicate process config
    if (current.operation() == "insert") {
        var duplicateProcessConfig = processConfigUtil.getDuplicateProcessConfig(current.table, 
										current.getUniqueValue(), current.getValue("content_pack"));
        if (!gs.nil(duplicateProcessConfig)) {
            var link = '<a href="' + duplicateProcessConfig + '" target="_blank">Click here</a>';
            var error = gs.getMessage("Only one process configuration is allowed per table. {0} to view existing process configuration for '{1}' table", [link, current.table]);
            gs.addErrorMessage(error);
            current.setAbortAction(true);
        }
    }

    //Validate worknotes time range
    var timeRange = current.getValue("work_note_transition_time_range");
    if (!gs.nil(timeRange) && !processConfigUtil.isWorkNotesTimeRangeValid(timeRange)) {
        gs.addErrorMessage(gs.getMessage("The Work Notes Time range value cannot be '{0}'. The acceptable time range is between 0 to 300 seconds.", [timeRange]));
        current.setAbortAction(true);
    }

	//Validate worknotes min length
	var workNoteMinLength = current.getValue("work_note_min_length");
	if(gs.nil(workNoteMinLength) || parseInt(workNoteMinLength) < 5) {
		gs.addErrorMessage(gs.getMessage("Minimum work note length cannot be less than 5"));
        current.setAbortAction(true);
	}

	//Validate worknotes max length
	var workNoteMaxLength = current.getValue("work_note_max_length");
	if(gs.nil(workNoteMaxLength) || parseInt(workNoteMaxLength) < parseInt(workNoteMinLength)) {
		gs.addErrorMessage(gs.getMessage("Maximum work note length should be more than Minimum work note length"));
        current.setAbortAction(true);
	}

    //Validate worknotes fields limit
    var workNotesFields = current.getValue("work_note_field_name");
    if (!processConfigUtil.isFieldCountValid(workNotesFields, 3)) {
        gs.addErrorMessage(gs.getMessage("Max {0} Journal input fields are allowed for Work notes summarization", [3]));
        current.setAbortAction(true);
    }
	if(previous.getValue("work_note_field_name") != workNotesFields) {
		var table = current.getValue("table");
		var invalidFields = [];
		workNotesFields.split(",").forEach(function(field) {
			if (!processConfigUtil.isWorkNotesFieldValid(current.getValue("table"), field)) {
				invalidFields.push(field);
			}
		});
		if(invalidFields.length > 0) {
			gs.addErrorMessage(gs.getMessage("Following work notes field(s) are not of type Journal Input or Journal: {0} and cannot be saved", [invalidFields.join(",")]));
			current.setAbortAction(true);
		}
	}
	//validate touch points time range
	var touchPointTimeRange = current.getValue("touch_point_time_range");
    if (!gs.nil(touchPointTimeRange) && parseInt(touchPointTimeRange) < 0) {
        gs.addErrorMessage(gs.getMessage("The Touchpoint time range value cannot be less than 0"));
        current.setAbortAction(true);
    }

	//Validate touch points field limit
	var touchPointFields = current.getValue("touch_point_fields");
    if (!processConfigUtil.isFieldCountValid(touchPointFields, 5)) {
        gs.addErrorMessage(gs.getMessage("Max {0} fields are allowed for Touchpoint calculation", [5]));
        current.setAbortAction(true);
    }
	if(gs.nil(touchPointFields)) {
		current.setValue("enable_touch_point", false);
	}

})(current, previous);
