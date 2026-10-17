// form functionality - URL parameter driven
(function($sp, input, data, options, gs) {
  /* "use strict"; -linter issues */
  // populate the 'data' variable
	data.attachmentUploadSuccessMsg = gs.getMessage("Attachment upload was successful");
	data.recordAddedMsg = gs.getMessage("Record Added");
	data.updatedMsg = gs.getMessage("Record Updated");
	data.exportPDFMsg = gs.getMessage("Export to PDF");
	data.exportPDFLandMsg = gs.getMessage("Export to PDF (landscape)");
	data.addAttachmentMsg = gs.getMessage("Add an attachment");
	data.supportedAttachmentExtensions = gs.getProperty("glide.attachment.extensions", '');
	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	data.advancedUIEnabled = (gs.getProperty("glide.ui.advanced") == "true");
	data.closeWindowMsg = gs.getMessage("Close Window");
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	data.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "" + data.maxAttachmentSize + "MB");

	data.isAdmin = gs.hasRightsTo('sp/configure.all/execute', null);
	data.emptyStateTemplate = options.empty_state_template;
	var isPopup = false;

	function updateEsToggle() {
		var scriptFields = getServerScriptFields(input);
		for (var i = 0; i < scriptFields.length; i++) {
        var scriptField = scriptFields[i];
			var isToggleValueSaved = GlideSystemUtilScript._getScriptErrorWithToggle(scriptField.value, input.scope, data.table, input.sys_id, input.esLatestVersion);
			if (isToggleValueSaved != null) {
					gs.addErrorMessage(gs.getMessage("Could not save record because of a compile error: {0}", isToggleValueSaved));
					return true;
			}	
		}
		return false;
	}

	if (input) {
		data.table = input.table;
		data.sys_id = input.sys_id;
		data.view = input.view;
    if (input.preventUrlUpdateOnSubmit)
      data.preventUrlUpdateOnSubmit = input.preventUrlUpdateOnSubmit;
		var result = {};

		if ((input.sys_id != '-1' || data.sys_id != '-1') && input.f && input.f._fields && input.isInsert) {
			var hasError = updateEsToggle();
			if (hasError)
	      return;
		}

		if (input._fields) {
			result = $sp.saveRecord(input.table, input.sys_id, input._fields);
			data.sys_id = result.sys_id;
		}

		if (input.sys_id == '-1')
			data.isNewRecord = true;
		if (input.isPopup === true)
			isPopup = true;
	} else {
		data.table = options.table || $sp.getParameter("t") || $sp.getParameter("table") || $sp.getParameter("sl_table");
		data.sys_id = options.sys_id || $sp.getParameter("sys_id") || $sp.getParameter("sl_sys_id");
		if (!data.sys_id && options.sys_id_required != "true")
			data.sys_id = "-1";
		data.view = options.view || $sp.getParameter("view") || $sp.getParameter("v"); // no default
	}

  	if (isPopup && gs.getProperty("glide.service_portal.reference.use_sys_popup_view", "false") == "true") {
		options.hideRelatedLists = true;
		options.disableUIActions = "true";
	}
	data.hideRelatedLists = options.hideRelatedLists || (input && input.hideRelatedLists) || false;
	data.disableUIActions = options.disableUIActions === "true" || !!(input && input.disableUIActions);

	data.query = (input && input.query) ? input.query : ($sp.getParameter("query") || options.query || "");
	data.f = {};
	if (!data.table)
		return;

	// Form widget is not a supported way to view an attachment
	if (data.table == "sys_attachment") {
		data.tableUnsupported = true;
		return;
	}

	if (!GlideTableDescriptor.isValid(data.table))
		return;

	if (!data.sys_id)
		return;

	var rec = $sp.getRecord(data.table, data.sys_id, true);

 	if (data.sys_id != "-1" && !rec.canRead())
		return; // can't see requested record

	if (data.sys_id == "-1" && !rec.canCreate())
		return; // can't create a new record

	data.isValid = rec.isValid() || data.sys_id == "-1";
	if (!data.isValid)
		return;

	data.table = rec.getRecordClassName();
	data.tableHierarchy = GlideDBObjectManager.getTables(data.table).toArray().join();
	data.canWrite = rec.canWrite();
	var hasRecordAccess = data.sys_id == "-1" ? rec.canCreate() : data.canWrite;
	data.canAttach = !options.omitAttachmentButton && hasRecordAccess && gs.hasRole(gs.getProperty('glide.attachment.role')) && !GlideTableDescriptor.get(data.table).getED().getBooleanAttribute("no_attachment");
	data.f = $sp.getForm(data.table, data.sys_id, data.query, data.view, isPopup);

	if (data.f && data.f._fields) {
		for (var key in data.f._fields) {
			if ((data.f._fields[key].type === 'script' || data.f._fields[key].type === 'script_plain') && !data.f._fields[key].attributes.client_script) {
        if (typeof data.esLatestVersion === 'undefined')
				  data.esLatestVersion = data.sys_id == "-1" || $sp.shouldUseESLatest(data.table, data.sys_id);
				data.f._fields[key].useEsLatest = data.esLatestVersion;
			}
		}
	}
	
	function getServerScriptFields(inputData) {
		var fields = [];
		if (inputData.f && inputData.f._fields) {
			for (var fieldName in inputData.f._fields) {
				var field = inputData.f._fields[fieldName];
				if ((field.type === 'script' || field.type === 'script_plain') && !field.attributes.client_script) 
					fields.push(field);
			}
		}
		return fields;
	}

	// PRB1335036: show appropriate message when record is in cross app scope
	data.f.outOfScope = !rec.isInSelectedScope();
	// Populate scope labels only when needed
	if (data.f.outOfScope) {
		data.f.recordScopeLabel = gs.getScopeLabelByRecordId(rec.getUniqueValue());
		data.f.currentScopeLabel = gs.getCurrentApplicationName();
	}
  var policies = data.f.policy || []
	policies.forEach(function(policy, index){
    if (policy['is_ui_data_policy']) {
      policies[index].onload = true;
    }
  })
	// Activity formatter is hardcoded to set specific options
	for (var f in data.f._formatters) {
		var fm = data.f._formatters[f];
		if (fm.formatter == "activity.xml") {
			fm.hardcoded = true;
			fm.widgetInstance = $sp.getWidget('widget-ticket-conversation',
																{table: data.table,
																 sys_id: data.sys_id,
																 includeExtended: true,
																 hideAttachmentBtn: true,
																 title: "${Activity}",
																 use_dynamic_placeholder: true,
																 btnLabel: "${Post}"});
		} else if(fm.formatter == "com_glideapp_servicecatalog_veditor" || fm.formatter == "com_glideapp_questionset_default_question_editor") {
			var qsConfig = $sp.getValue('quick_start_config');
			if (qsConfig)
				qsConfig = JSON.parse(qsConfig)[0];
			fm.widgetInstance = $sp.getWidget(fm.widget, {table: data.table,
														sys_id: data.sys_id,
														readonly_variable_editor: qsConfig ? qsConfig.readonly_variable_editor : 'false'});
		} else
			fm.widgetInstance = $sp.getWidget(fm.widget, data);
	}
})($sp, input, data, options, gs);
