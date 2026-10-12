(function(){
	data.depsMsg = gs.getMessage("Dependencies");
	data.templatesMsg = gs.getMessage("Templates");
	
	data.htmlBlockMsg = gs.getMessage("HTML Template");
	data.cssBlockMsg = gs.getMessage("CSS - SCSS");
	data.clientScriptMsg = gs.getMessage("Client Script");
	data.serverScriptMsg = gs.getMessage("Server Script");
	data.linkMsg = gs.getMessage("Link Function");
	data.demoDataMsg = gs.getMessage("Demo Data (JSON)");
	data.previewMsg = gs.getMessage("upper_preview");
	data.docMsg = gs.getMessage("Documentation");
	data.errorMsg = gs.getMessage("Error when saving the widget");
	
	data.angularProviders = [];
	data.sys_id = (input) ? input.sys_id : $sp.getParameter('sys_id');
	data.layoutPref = gs.getPreference("wep-layout");
	data.providersPref = gs.getPreference("wep-provider-" + data.sys_id);
	data.templatesPref = gs.getPreference("wep-template-" + data.sys_id);
	data.table = "sp_widget";
	
	var gr = new GlideRecord('sp_widget');
	data.canCreate = gr.canCreate();

	if (data.sys_id) {
		// Validate sys_id to prevent querying invalid sys ids.
		if (!GlideStringUtil.isEligibleSysID(data.sys_id)) {
			showErrorDetails(data.sys_id);
			return;
		}

		gr = new GlideRecordSecure('sp_widget');
		var q = gr.addQuery('sys_id', data.sys_id);
		gr.query();
		if (!gr.next()) {
			showErrorDetails(data.sys_id);
			return;
		}
		if (gr.getValue('public') == 1){
			var server_script = gr.getValue('script');
			if(server_script && (server_script.indexOf('GlideRecord') > -1 || server_script.indexOf('GlideRecordSecure') > -1))
				gs.addInfoMessage(gs.getMessage("Secure public widgets using widget access controls. This widget is public and queries data from tables. <a href=https://docs.servicenow.com/?context=secure-widgets target='_blank' > Learn more.</a>"));
		}
	}
	
	function showErrorDetails(sysId) {
		gs.addErrorMessage("cannot find widget " + GlideStringUtil.escapeHTML(sysId));
		data.error = true;
	}

	function getServerScriptField(inputData) {
		var scriptField = null;
		if (inputData.f && inputData.f._fields) 
			scriptField = inputData.f._fields.script;
		return scriptField;
	}
	
	
	// save the contents
	if (input && input.action == "save") {
		if (!gr.isInSelectedScope()) {
			gs.addErrorMessage("This widget is in the <strong>" + gs.getScopeLabelByRecordId(gr.getUniqueValue()) + "</strong> application, but <strong>"+ gs.getCurrentApplicationName() +"</strong> is your current application");
			data.error = true;
			return;
		}
		
		//update the toggle value
		var serverScriptField = getServerScriptField(input)
		if (serverScriptField !== null) {
			var isToggleValueSaved = GlideSystemUtilScript._getScriptErrorWithToggle(serverScriptField.value, input.scope, 'sp_widget', input.sys_id, input.esLatestVersion);
			if (isToggleValueSaved != null) {
					gs.addErrorMessage(gs.getMessage("Could not save record because of a compile error: {0}", isToggleValueSaved));
					return;
			}
		}
		
		result = $sp.saveRecord(input.f.table, input.f.sys_id, input.f._fields);
		
		input.angularProviders.map(function(provider) {
			$sp.saveRecord(provider.f.table, provider.f.sys_id, provider.f._fields);
		});
		
		data.angularProviders = input.angularProviders;
		
		input.ngTemplates.map(function(template) {
			$sp.saveRecord(template.f.table, template.f.sys_id, template.f._fields);
		});
		
		data.ngTemplates = input.ngTemplates;
		
		if (input.updatedDocContent && input.updatedDocContent != input.docContent) {
			var widgetGR = new GlideRecordSecure("sp_widget");
			if (widgetGR.get(data.sys_id)) {
				var documentationGR;

				if (widgetGR.getValue("docs")) {
					documentationGR = widgetGR.getElement("docs").getRefRecord();
					documentationGR.setValue("content", input.updatedDocContent);
					documentationGR.update();
				} else {
					documentationGR = new GlideRecordSecure("sp_documentation");
					documentationGR.initialize();
					documentationGR.setValue("content", input.updatedDocContent);
					documentationGR.setValue("title", widgetGR.getValue("name"));
					var documentationID = documentationGR.insert();
					widgetGR.setValue("docs", documentationID);
					widgetGR.update();
				}
			}
		}

		data.saved = result;
		return;
	}

	data.canRead = gr.canRead();
	data.canWrite = gr.canWrite() && gr.getDisplayValue("read_only") !== "true";
	data.outOfScope = !gr.isInSelectedScope();
	data.recordScopeLabel = gs.getScopeLabelByRecordId(gr.getUniqueValue());
	data.currentScopeLabel = gs.getCurrentApplicationName();
	data.snWidgetScopeJsLevel = getJsLevel(data.sys_id);
	var isNewRecord = data.sys_id == -1 || gr.isNewRecord();
	data.esLatestVersion = isNewRecord || $sp.shouldUseESLatest('sp_widget', data.sys_id);

	// add new modal
	data.widgetAddNew = $sp.getWidget('widget-add-new', {});
	if (!data.sys_id)
		return;

	// Nested Widgets - clone and option schema
	data.widgetClone = $sp.getWidget('widget-clone', {sys_id: data.sys_id});
	data.widgetOptionSchemaModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'we20', embeddedWidgetOptions: {sys_id: data.sys_id}});


	data.title = gr.getValue("name");
	// get the model for the widget from spForm
	data.f = $sp.getForm('sp_widget', gr.getUniqueValue());
	data.docContent = (data.f._fields.docs.value) ?
		gr.getElement("docs").getRefRecord().getValue("content") :
		getDocs("948bab53d721120023c84f80de61034e");
	
	// Get any related angular providers
	var m2mProviderGR = new GlideRecordSecure("m2m_sp_ng_pro_sp_widget");
	m2mProviderGR.addQuery("sp_widget", data.sys_id);
	m2mProviderGR.query();
	while (m2mProviderGR.next()) {
		var providerGR = m2mProviderGR.getElement("sp_angular_provider").getRefRecord();
		if (!providerGR.canRead())
			continue;

		var provider = {
			show: false,
			name: providerGR.getValue("name"),
			f: $sp.getForm('sp_angular_provider', providerGR.getUniqueValue(), null, 'sp', false, false),
			type: 'provider'
		};
		data.angularProviders.push(provider);
	}
		
	var ngTemplates = new GlideRecordSecure("sp_ng_template");	
	ngTemplates.addQuery("sp_widget", data.sys_id);
	ngTemplates.query();
	
	data.ngTemplates = []
	
	while (ngTemplates.next()) {		
		data.ngTemplates.push({
			show: false,
			name: ngTemplates.getValue("id"),
			f: $sp.getForm('sp_ng_template', ngTemplates.getUniqueValue(), null, 'sp', false, false),
			type: 'template'
		});		
	}

	function getJsLevel(id) {
		var gr = new GlideRecordSecure('sp_widget');
		if (gr.get(id)) {
			data.scope = gr.sys_scope.toString();
			return gr.sys_scope.js_level.toString();
		}
		return '';
	}
	
	
	function getDocs(id) {
		var gr = new GlideRecordSecure('sp_documentation');
		gr.get(id);
		return gr.getValue("content");
	}	
})()
