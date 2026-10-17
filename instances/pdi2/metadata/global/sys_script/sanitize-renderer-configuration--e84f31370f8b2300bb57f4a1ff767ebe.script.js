(function executeRule(current, previous /*null when async*/) {
	var isRecordType = current.getValue('renderer_type') == "record" ||
		current.getDisplayValue('type_ext').toLowerCase() === "record";
	var fixFieldsForRecordType = function () {
		// Clear render_type if type_ext is set
		if (current.type_ext)
			current.renderer_type = "";

		// make sure only either custom renderer or workspace module is provided
		// based on the module flag	for 'record' renderer type
		if (current.module_flag) {
			// empty custom_renderer if module_flag is true
			current.custom_renderer = "";
			current.custom_renderer_tag = "";
		} else {
			// empty workspace_module if module_flag is false
			current.workspace_module = "";
		}
	};
	var fixFieldsForNonRecordType = function () {
		if (current.type_ext)
			current.renderer_type = "";

		// explicitly set table to null in case of improper table updates
		if (current.table)
			current.table = "";

		// empty workspace_module if module_flag is false
		if (!current.module_flag)
			current.workspace_module = "";
	};
	var enforceUniqueForNonRecordType = function () {
		var wsConfig = current.workspace_config;
		var isUpdate = current.operation() == 'update';
		var isInsert = current.operation() == 'insert';
		var typeChanged = current.renderer_type != previous.renderer_type;
		var typeExists = false;
		var renderers = new GlideRecord('sys_aw_renderer');
		if (current.type_ext)
			renderers.addQuery('type_ext', current.type_ext);
		else
			renderers.addQuery('renderer_type', current.renderer_type);
		renderers.addQuery('workspace_config', wsConfig);
		renderers.query();
		typeExists = renderers.hasNext();

		// if it is an update with renderer type changed to an existing one, then abort
		if (isUpdate && typeExists && typeChanged) {
			gs.addErrorMessage(gs.getMessage(
				"Renderer Type '{0}' is already configured for this workspace.",
				current.getDisplayValue('type_ext')));
			current.setAbortAction(true);
		}
		// if it is an insert with renderer type that already exists, then abort
		else if (isInsert && typeExists) {
			gs.addErrorMessage(gs.getMessage(
				"Renderer Type '{0}' is already configured for this workspace.",
				current.getDisplayValue('type_ext')));
			current.setAbortAction(true);
		}
	};

	if (isRecordType) {
		fixFieldsForRecordType();
	} else {
		fixFieldsForNonRecordType();
		enforceUniqueForNonRecordType();
	}
})(current, previous);
