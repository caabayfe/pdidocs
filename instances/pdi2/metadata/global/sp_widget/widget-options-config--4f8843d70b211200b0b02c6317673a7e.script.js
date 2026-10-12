// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
(function(){
	data.otherOptionsText = gs.getMessage("Other Options");
	data.emptyChoiceMsg = gs.getMessage("-- None --");
	var sys_id = options.sys_id || input.sys_id;
	var table = options.table || input.table;
	var hideRelatedLists = options.hideRelatedLists || input.hideRelatedLists || true;
	var gr = new GlideRecordSecure(table);
	gr.get(sys_id);
  
	data.isInstance = gr.instanceOf("sp_instance");
	data.field_list = gr.getDisplayValue('sp_widget.field_list');
	data.option_schema = gr.getDisplayValue('sp_widget.option_schema');
	data.wp = gr.getValue("widget_parameters");
	var j;
	try {
		var optionsJO;
		try {
			// parse options from the sp_instance record being edited
			optionsJO = JSON.parse(data.wp);
		} catch(e) {
		} finally {
			if (optionsJO == null)
				optionsJO = {};
		}
		j = JSON.parse(data.option_schema);
		j.forEach(function(f) {
			if (f.type == "reference" || f.type == "glide_list") {
				var refGR = new GlideRecordSecure(f.ed.reference);
				f.ed.searchField = refGR.getDisplayName();
				f.refTable = f.ed.reference;
				f.validValues = "";
				if (optionsJO[f.name] && optionsJO[f.name].value) {
					var recordList = optionsJO[f.name].value.split(",");
					var displayValues = {};
					// look up current display values for referenced records
					refGR.addQuery("sys_id", recordList);
					refGR.query();
					f.currentDisplay = "";
					var validRecordList = [];
					var displayArr = [];
					while (refGR.next()) {
                                          var sysId = refGR.getUniqueValue();
                                          displayValues[sysId] = refGR.getDisplayValue();
                                          validRecordList.push(sysId);
					}
					// Sorting as per recordList order is required to maintain the original order of the record list
					validRecordList.sort(function(a, b){
						return recordList.indexOf(a) > recordList.indexOf(b) ? 1 : -1;
					});
					f.validValues = validRecordList.join(',');
					for (var i = 0; i < validRecordList.length; i++) {
					    f.currentDisplay = displayValues[validRecordList[i]];
					    displayArr.push(f.currentDisplay);
					}
					if (f.type == "glide_list")
						f.currentDisplay = displayArr.length > 0 ? displayArr : ""; // glide_list takes Array of display values
				}

				// provide readable display for default value
				f.defaultDisplayValue = "";
				if (f.default_value) {
					var displayGR = new GlideRecordSecure(f.ed.reference);
					displayGR.addQuery("sys_id", "IN", f.default_value);
					displayGR.query();
					while (displayGR.next()) {
						if (f.defaultDisplayValue != "")
							f.defaultDisplayValue += ", ";
						var newDV = displayGR.canRead() ? displayGR.getDisplayValue() : displayGR.getUniqueValue();
						f.defaultDisplayValue += newDV;
					}		
				}
			} //f.type == "reference" || f.type == "glide_list"
			
			// Add translations for choice labels
			if(f.type == "choice") {
				f.choices.forEach(function(item) {
					item.label = gs.getMessage(item.label);
				});
			}

			// Add translation for string type default values
			if (f.type == "string" && f.default_value)
				f.default_value = gs.getMessage(f.default_value);

			if (f.hint)
				f.hint = gs.getMessage(f.hint);
      if (f.label)
        f.label = gs.getMessage(f.label);
		})
	} catch(e1) {
		j = [];
	}
	data.option_schema = JSON.stringify(j);
	var opts = {
		table: table,
		sys_id: sys_id,
		hideRelatedLists: hideRelatedLists,
		omitHeaderOptions: 'true',
		ensurePlatformLink: 'true',
		disableUIActions: 'true',
		omitAttachmentButton: true,
		view: 'sp_instance_config'
	};
	data.modalForm = $sp.getWidget('widget-modal', {embeddedWidgetId: 'widget-form', embeddedWidgetOptions: opts});

	// if widget_parameters isn't in field_list, add it so it saves properly
	var schemaLength = 0;
	if (!GlideStringUtil.nil(data.option_schema)) {
		try {
			schemaLength = JSON.parse(data.option_schema).length
		} catch(e) {}
	}
	if (GlideStringUtil.nil(data.field_list) && schemaLength > 0)
		data.field_list = "widget_parameters";
	if (!GlideStringUtil.nil(data.field_list) && data.field_list.indexOf("widget_parameters") == -1)
		data.field_list += ",widget_parameters";
})()
