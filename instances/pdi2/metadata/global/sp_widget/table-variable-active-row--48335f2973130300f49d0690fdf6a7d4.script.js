(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.actions = {
		ADD_ROW : "add",
		EDIT_ROW : "edit"
	};
	var m = data.msgs = {};
	m.addRowTitleMsg = gs.getMessage("Add Row");
	m.editRowTitleMsg = gs.getMessage("Edit Row");
	m.addRowButtonlabel = gs.getMessage("Add");
	m.editRowButtonLabel = gs.getMessage("Save");
	m.closeRowButtonLabel = gs.getMessage("Cancel");
	m.closeModalMsg = gs.getMessage("Close modal");
	m.duplicateUniqueFieldErrMsg = gs.getMessage('Some fields are not unique: {0}');

	data.sys_properties = {
		mobileNativeColor: gs.getProperty("glide.sc.mobile.primary_color", "#1f8476"),
		isPolaris: gs.getProperty("glide.ui.polaris.experience", "false")
	};

	function getReqObj(options) {
		var req = {
			action : "" + options.action,
			source_table : "" + options.source_table,
			source_id : "" + options.source_id,
			variable_set_id : "" + options.variable_set_id,
			variable_set_name : "" + options.variable_set_name,
			row_data : "" + JSON.stringify(options.row_data)
		};
		if (options.cat_item) {
			req.cat_item = "" + options.cat_item;
		}
		if (typeof options.workspace_form !== 'undefined') {
			req.workspace_form = "" + options.workspace_form;
		} else
			req.workspace_form = "false";
		return req;
	}

	var req;
	if (options.variable_set_id)
		req = getReqObj(options);
	else
		req = getReqObj(input);

	data.active_row = $sp.getTableVariableRow(req);
	data.active_row.parent = options.parent;
	data.rowData = options.row_data;
	data.action = req.action;
	data.active_row_meta = [];
	data.cat_item = options.cat_item || "";
	data.variable_set_id = options.variable_set_id || "";

	data.isMEE = options.native_mobile == true;

	function getRowData(options) {
		return options.row_data;
	}

	function augmentFieldTypeForWorkspace(fields) {
		for (var f in fields) {
			var field = fields[f];
			var q = GlideappQuestion.getQuestion(field.sys_id);
			if (JSUtil.nil(q))
				continue;
			if (q.getType() == 28) {
				field.type = 'ip_address';
			}
		}
	}

	//Special handling for workspace Veditor Orlando
	if (req.workspace_form == "true") {
		augmentFieldTypeForWorkspace(data.active_row._fields);
	}

	if (req.action == data.actions.EDIT_ROW) {
		var fields = data.active_row._fields;
		var rowData = !!options.variable_set_id ? getRowData(options) : getRowData(input);

		for (var f in fields) {
			var field = fields[f];
			var fieldName;
			if (field.name in rowData)
				fieldName = field.name;
			else if ('variables.' + field.name in rowData)
				fieldName = 'variables.' + field.name;
			else
				continue;
			var q = GlideappQuestion.getQuestion(field.sys_id);
			if (JSUtil.nil(q))
				continue;
			q.setValue(rowData[fieldName]);
			//gs.info(qId + " " + key + " " + options.row_data[key]);

			//Special handling for workspace Veditor Orlando for Duration Variable.
			if (q.getType() == 29 && req.workspace_form == "true") {
				field.value = rowData[fieldName];
				field.displayValue = rowData[fieldName];
				continue;
			}

			// handle masked variable
			if (q.getType() == 25) {
				field.value = GlideappMaskedQuestion.canDecrypt(null, req.source_table) ? q.decrypt(q.getValue()) : q.getValue();
			} else {
				field.value = q.getValue();
			}
			if (q.getType() == 9 || q.getType() == 10)
				field.displayValue = q.getValue();

			field.display_value_list = q.getDisplayValues().toArray();

			if (q.hasPricingImplications())
				updatePriceOnField(field);
		}
	}

	function updatePriceOnField(field) {
		if ((field.type === "choice" || field.type === "multiple_choice") && field.choices) {
			field.choices.forEach(function(choice) {
				if (choice.value + '' === field.value + '') {
					if (choice.price)
						field.price = choice.price;
					if (choice.recurring_price)
						field.recurring_price = choice.recurring_price;
				}
			})
		}
	}
})();
