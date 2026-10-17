(function(){
	var tableName = $sp.getParameter('table');

	var sysId = $sp.getParameter('sys_id');
	var record = sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);
	data.isExternalUser = !gs.hasRole('snc_internal');
	data.is_new_order = (($sp.getParameter("is_new_order") + '') === "true");
	data.canRead = hasReadAcces(record);
	if (!data.canRead)
		return;

	if ($sp.getParameter('headless') == 'true')
		data.headless = true;
	else if ($sp.getParameter('headless') == 'false')
		data.headless = false;
	else if ($sp.getParameter('headless') == null)
		data.headless = false;
	else
		return;

	tableName = record.getTableName();
	sysId = record.getUniqueValue();

	var sdField;
	var headerFields = {};
	var showDomainState = false;

	//URL has domain table
	if (tableName != 'universal_request') {
		//Check if universal_request field is present and it is a universal request
		if (record.isValidField('universal_request') && !record.universal_request.nil()) {
			data.urLink = '?id=standard_ticket&table=universal_request&sys_id=' + record.universal_request.sys_id;
			var ur = sn_std_tkt_api.TicketConfig.getTicketRecord('universal_request', record.universal_request);
			if (!hasReadAcces(ur)) {
				readHeaderFields(record);
				showDomainState = true;
			} else {
				data.number = $sp.getField(ur, 'number');
				headerFields.created = $sp.getField(ur, 'sys_created_on');
				headerFields.updated = $sp.getField(record, 'sys_updated_on');
				headerFields.state = $sp.getField(ur, 'state');
				sdField = $sp.getField(ur, 'short_description');
			}
			//URL-non primary ticket
			if (record.universal_request.primary_task != record.sys_id)
						data.primary_ticket_link = '?id=standard_ticket&table=universal_request&sys_id=' + record.universal_request;
		}
		//It is a domain ticket
		else {
			readHeaderFields(record);
			showDomainState = true;
		}
 }
  //URL-Table name is universal request
	else {
		//Domain ticket is created
		if (!record.primary_task.nil()) {
			data.urLink = '?id=standard_ticket&table=universal_request&sys_id=' + record.sys_id;
			var primary_table = record.primary_task.getRefRecord().getTableName();
			var primaryGR = sn_std_tkt_api.TicketConfig.getTicketRecord(primary_table, record.primary_task + '');
			data.canReadPrimary = hasReadAcces(primaryGR);
			if (!data.canReadPrimary) {
				readHeaderFields(record);
				record = sn_std_tkt_api.TicketConfig.getTicketRecord(primary_table, record.primary_task);
			} else { //can read primary ticket
				sdField = $sp.getField(record, 'short_description');
				data.number = $sp.getField(record, 'number');
				headerFields.created = $sp.getField(record, 'sys_created_on');
				headerFields.updated = $sp.getField(primaryGR, 'sys_updated_on');
				headerFields.state = $sp.getField(record, 'state');

				record = sn_std_tkt_api.TicketConfig.getTicketRecord(primary_table, record.primary_task);
				tableName = record.getTableName();
				sysId = record.getUniqueValue();
			}
		}
		//No domain ticket assigned
		else
			readHeaderFields(record);
	}

	if (sdField == null || !sdField.value) {//Use number if SD is not there
		data.SDIsEmpty = true;
		sdField = data.number;
	}

	data.title = sdField ? sdField.display_value : record.getLabel();
	data.headerFields = headerFields;
	data.requestSubmitMsg = gs.getMessage("Thank You. Your request {0} has been submitted." , data.number ? data.number.display_value : "");

	data.canReadConfig = hasReadAcces(record);
	if (!data.canReadConfig)
		return;

	var config = sn_std_tkt_api.TicketConfig.getConfig(tableName, record.sys_domain);

	if (config) {
		if (showDomainState && config.state_field != 'state') {
			var configState = $sp.getField(record, config.state_field);
			headerFields.state = configState;
		}
		data.show_info_widget = config.show_info_widget;
		if (!data.show_info_widget)
			showConfigTicketFields (config, record);
		else
			showTicketWidget(config, tableName, sysId);

		data.table = tableName;
		data.sys_id = sysId;
		
		data.showInfoFields = config.showInfoFields || true;

		showActionWidget(config, tableName, sysId);
		var descriptionField = config.description_field || 'description';
		if (record.isValidField(descriptionField)) {
			var field = record.getElement(descriptionField);
			if (field && field.canRead())
				showDescription(config, record, descriptionField);
		}
	}

	function hasReadAcces(record) {
		return (record != null && record.isValid() && record.canRead());
	}

	function readHeaderFields(record) {
		sdField = $sp.getField(record, 'short_description');
		data.number = $sp.getField(record, 'number');
		headerFields.created = $sp.getField(record, 'sys_created_on'); 
		headerFields.updated = $sp.getField(record, 'sys_updated_on');
		headerFields.state = $sp.getField(record, 'state');
	}

	function showConfigTicketFields(config, record) {
		var fieldNames = [];
			if (config.info_fields)
				fieldNames = config.info_fields.split(',');
		var fields = [];
		if (record.getTableName() == 'sc_req_item' && !record.cat_item.nil()) {
			var catalogItemJS = new sn_sc.CatItem(record.cat_item);
			var cartItemDetail = catalogItemJS.getItemSummary(true);
		}
			fieldNames.forEach(function (fName) {
				if ((!fName || fName == ''))
					return;

				var fElement = record.getElement(fName);
				if (!fElement)
					return;

				if (!fElement.canRead())
					return;

				if(fName == 'recurring_price' && record.recurring_frequency.nil())
					return;

				if (fName == 'price' || fName == 'recurring_price') {
					var showPrice = canShowPrice(catalogItemJS, record.getValue(fName));
					if (!showPrice)
						return;
				}
				var hideQuantity = (fName == 'quantity') && !cartItemDetail.show_quantity;
				if (hideQuantity)
					return;

				var type = fElement.getED().getInternalType();
				if (type == 'glide_list')
					loadGlideListFieldInfo(fElement, fName, type, record, fields);
				else if (type == 'workflow')
					loadWorkflowFieldInfo(fElement, fName, type, record, fields);
				else {
					var f = {
						display_value: (fName == 'recurring_price' && !record.recurring_frequency.nil()) ? (fElement.getDisplayValue() + " " + record.getDisplayValue('recurring_frequency')) : fElement.getDisplayValue(),
						label: fElement.getLabel(),
						name: fElement.getName(),
						type: type,
						value: (fName == 'sys_updated_on' && record.getValue("sys_mod_count") <= 0) ? '' : fElement.toString()
					};

					if (!f.value)
						return;

					if (type == 'reference') {
						var reference = fElement.getReferenceTable();
						var grs = new GlideRecordSecure(reference);
						if (!(grs.get(f.value) && grs.getDisplayName() && grs.getValue(grs.getDisplayName())))
							return;

						f.reference = reference;

						if (reference == 'sys_user') {
							f.user = {
								userID: f.value,
								name: f.display_value,
								avatar: GlideAvatarFinder.getAvatarPath(f.value),
								initials: buildInitials(f.display_value)
							}
						}
					}
					fields.push(f);
				}
			});

			data.fields = fields;
	}

	function loadGlideListFieldInfo(fElement, fName, type, record, fields) {
		var val = fElement.toString();
		var f = {
			display_value: fElement.getDisplayValue() ? fElement.getDisplayValue().split(",") : '',
			label: fElement.getLabel(),
			type: type,
			value: val ? val.split(",") : '',
			reference: fElement.getED().getReference()
		};
		if (!f.value)
			return;

		var gReference = fElement.getED().getReference();
		if (gReference == 'sys_user') {
			f.user = [];
			for(var u = 0; u < f.value.length; u++){
				f.user.push(person = {
					userID: f.value[u],
					name: f.display_value[u],
					avatar: GlideAvatarFinder.getAvatarPath(f.value[u]),
					initials: buildInitials(f.display_value[u])
				})
			}
		}
		fields.push(f);
	}

	function loadWorkflowFieldInfo(fElement, fName, type, record, fields) {
		var f = {
			display_value: fElement.getDisplayValue(),
			label: fElement.getLabel(),
			type: type,
			value: fElement.toString()
		};
		f.stageWidget = $sp.getWidget('request_item_workflow_stages', {req_item_id: sysId});
		fields.push(f);
	}

	function showTicketWidget(config, tableName, sysId) {
		var widgetParam = config.info_widget_param
			if (widgetParam)
				widgetParam = JSON.parse(widgetParam)
			else
				widgetParam = {};

			widgetParam.table = tableName;
			widgetParam.sys_id = sysId;

			data.info_widget = $sp.getWidget(config.info_widget, widgetParam);
	}

	function showActionWidget(config, tableName, sysId) {
		var actionWidget;
		var widgetParam;
		if (config.action_widget) {
			actionWidget = config.action_widget;
			widgetParam = config.action_widget_param;
		if (widgetParam)
				widgetParam = JSON.parse(widgetParam);
		else
			widgetParam = {};

		widgetParam.table = tableName;
		widgetParam.sys_id = sysId;
		} else {
			actionWidget = "d4a15cf9ff3122105146751b03cb1476";
			widgetParam = {};
			widgetParam.table = tableName;
			widgetParam.sys_id = sysId;
		}

		data.actionWidget = $sp.getWidget(actionWidget, widgetParam);
	}

	function setDescription(record, descriptionField) {
		var description = $sp.getField(record, descriptionField);
		if (description) {
			data.description = {
				'type' : description.type,
				'display_value' : description.display_value
			};
		}
	}

	function showDescription(config, record, descriptionField) {
		if (config.show_description == 'always')
			setDescription(record, descriptionField);

		else if (config.show_description == 'no_variable') {
			var variables = record.variables.getElements(true);
			if (variables.length == 0)
				setDescription(record, descriptionField);

		}
	}

	function buildInitials(name) {
		if (!name)
			return "--";

		var initialMatchRegex = /^[A-ZÀ-Ÿ]|^[\u3040-\u309f]|^[\u30a0-\u30ff]|^[\uff66-\uff9f]|^[\u4e00-\u9faf]/;
		// Included Hiragana, Katakana, CJK Unified Ideographs and Halfwidth and Fullwidth Forms Blocks
		// Hiragana -> Japanese words, Katakana -> foreign words
		// CJK Unified Ideographs -> modern Chinese, Japanese, Korean and Vietnamese characters

		var initials = name.split(" ").map(function(word) {
			return word.toUpperCase();
		}).filter(function(word) {
			return word.match(initialMatchRegex);
		}).map(function(word) {
			return word.substring(0,1);
		}).join("");
		return (initials.length > 3) ? initials.substr(0, 3) : initials;
	}

	function canShowPrice(itemJS, price) {
		return gs.getProperty('glide.sc.item.cannot_show_price', '').split(',').indexOf(itemJS.getRecordClass()) == -1 &&
			itemJS.read({'omit_price':''}).omit_price != 'true' &&
			typeof $sp.showPrice == 'function' ? $sp.showPrice(price) : fallbackShowPrice(price);
	}

	function fallbackShowPrice(price) {
		if (isNaN(price))
			return false;

		var showPriceProp = gs.getProperty('glide.sc.price.display', 'always');
		return (showPriceProp == 'non_zero' && parseFloat(price) <= 0)|| showPriceProp == 'never' ? false : true;
	}

	var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
	var hasSummarizeSkill = false;
	if (nowAssistSkillConfig != null && nowAssistSkillConfig.isSkillConfigurationActive("ab0992bf2fd432101960e34fafa4e3a8")) //Standard ticket summarization skill-id
		hasSummarizeSkill = true;
	
	data.isSummaryEnabled = config.summary_fields && hasSummarizeSkill;
	
	if (data.isSummaryEnabled) {
		data.popoverWidget = $sp.getWidget('standard_ticket_summary_modal', {
			table: data.table,
			id: data.sys_id
		});
	}
})()
