var GlobalServiceCatalogUtil = Class.create();
GlobalServiceCatalogUtil.prototype = {
    initialize: function() {
        this.CATALOG_SCRIPT_CLIENT = "catalog_script_client";
        this.CATALOG_UI_POLICY = 'catalog_ui_policy';
    },
    _mergeScriptsInPolicies: function(policies, scripts) {
        for (var i = 0; i < policies.length; i++) {
            var policy = policies[i];
            var name = policy['script_true'];
            if (name) {
                policy['script_true'] = {
                    'name': name,
                    'script': scripts[name]
                };
            }
            name = policy['script_false'];
            if (name) {
                policy['script_false'] = {
                    'name': name,
                    'script': scripts[name]
                };
            }
        }
        return policies;
    },

	getDefaultCatalog: function() {
		var defaultCatalog = SNC.Catalog.getDefaultCatalog();
		if(defaultCatalog) return defaultCatalog.getID();
		return null;
	},

    getCatalogUIPolicy: function(item, sets) {
        var builder = new CatalogUIPolicyBuilder(item);

        var gr = new GlideRecordSecure('catalog_ui_policy');
        gr.addActiveQuery();
        gr.addQuery('applies_to', 'item');
        gr.addQuery('catalog_item', item);
        gr.addQuery('applies_catalog', true);
        gr.orderBy('order');
        gr.query();
        builder.process(gr);

        if (sets) {
            sets = sets.split(',');
            for (var i = 0; i < sets.length; i++) {
                gr = new GlideRecord('catalog_ui_policy');
                gr.addActiveQuery();
                gr.addQuery('applies_to', 'set');
                gr.addQuery('catalog_item', item);
                gr.addQuery('applies_catalog', true);
                gr.orderBy('order');
                gr.query();
                builder.process(gr);
            }
        }
        builder.updateValues();
        return this._mergeScriptsInPolicies(builder.getFieldPolicies(), builder.getScripts());
    },

    stripScriptComments: function(script) {
        var sc = new global.JavaScriptCommentStripper().stripComments(script);
        sc.replaceAll('\r', '');
        return sc;

    },

    isWishListEnabled: function(catalogId) {
        //Checks if an item in a catalog can be added to wish list
        return new sn_sc.Catalog(catalogId).isWishlistEnabled();
    },

    getRequestForSysID: function(parentTable, parentID) {
        //returns the requestedForSysID for the given parentID and parentTable configuration
        var requestForSysID = '';
        if (JSUtil.notNil(parentID) && JSUtil.notNil(parentTable)) {
            var requestForField;
            var reqMapGR = new GlideRecord('request_parent_mapping');
            reqMapGR.addQuery('parent_table', parentTable);
            reqMapGR.query();
            if (reqMapGR.next()) {
                var recFound;
                requestForField = reqMapGR.requested_for_field;
                var parentRecGR = new GlideRecord(parentTable);
                if (parentRecGR.isValid()) {
                    recFound = parentRecGR.get(parentID);
                    if (recFound)
                        requestForSysID = parentRecGR.getValue(requestForField);
                }
            }
        }
        return requestForSysID;
    },

    getCatItemIconAltText: function(catItem) {
        //returns the catalog item icon's alt text
        var alt_text = '';
        if (JSUtil.notNil(catItem)) {
            alt_text = catItem.getName();
            var item_short_desc = catItem.getShortDescription();
            if (JSUtil.notNil(item_short_desc))
                alt_text = item_short_desc;
        }
        return alt_text;
    },

    isCatItemTable: function(tableName) {
        return GlideDBObjectManager.get().isInstanceOf(tableName, 'sc_cat_item');
    },

    getMaxRowCountMultiRowVS: function(variableSetId, srcTable, srcId) {
        return GlideappScriptHelper.getMaxRowCountMultiRowVS(variableSetId, srcTable, srcId);
    },

  	canReadApprovingRecord: function(approvingRecordId) {
		if (JSUtil.nil(approvingRecordId))
			return false;
		var approvalGr = new GlideRecord('sysapproval_approver');
		approvalGr.addQuery('sysapproval', approvingRecordId);
		approvalGr.query();

		while(approvalGr.next()) {
			if (new ApprovalDelegationUtil().isMyApproval(approvalGr))
				return true;
		}
		return false;
    },

    getVariablesForTask: function( /*task GR*/ gr, /*with MRVS*/ withMRVS) {
        var result = [];
        if (!gr.isValidRecord())
			return result;

        var variables = gr.variables.getElements(withMRVS);
		for (var i = 0; i < variables.length; i++) {
			var variable = variables[i];
			if (!variable.canRead())
				continue;

			if (variable.isMultiRow()) {
				var rows = variable.getRows();
				var table_variable = [];
				for (var j = 0; j < rows.length; j++) {
					var row = rows[j];
					var cells = row.getCells();
					var column = [];
					for (var k = 0; k < cells.length; k++) {
						var cell = cells[k];
						if (cell != null && cell.isValidCell())
							column.push({
								name: cell.getName(),
								label: cell.getLabel(),
								display_value: cell.getCellDisplayValue(),
								hideOnGrid: cell.isHideOnGrid()
							});
						else
							gs.log("GlobalServiceCatalogUtil: Invalid cell in table variable row");
					}
					table_variable.push(column);
				}

				if (rows.length == 0)
					continue;

				result.push({
					label: variable.getLabel(),
					visible_summary: true,
					multi_row: true,
					table_variable: table_variable,
					name: variable.getName()
				});

			} else {
				var question = variable.getQuestion();
				if (!question.getValue() || question.getValue() == '')
					continue;

				if (question.getType() =='33')
					var sysAttachment = new GlideSysAttachment(question.getValue());

				result.push({
					label: variable.getLabel(),
					display_value: question.getDisplayValue(),
					visible_summary: question.isVisibleSummary(),
					multi_row: false,
					type: question.getType(),
					value : question.getValue(),
					state : question.getType() =='33' && !GlideStringUtil.nil(question.getValue()) && sysAttachment.exists() ? sysAttachment.getState() : undefined
				});
			}
		}
		return result;
    },

	getRelativeDuration: function(args) {
		var duration = new global.DurationCalculator();
		duration.setSchedule(args["schedule"]);
		duration.setTimeZone(args["timezone"]);
		duration.calcRelativeDuration(args["relative_duration"]);
		return duration.getEndDateTime();
	},

	/**
	* data = {
	*	  sysparm_id: <catalog_item_sys_id>,
	*	  sysparm_quantity: <quantity>,
	*	  variables: {
	*	    variable_name: <value>
	*	  },
	*	}
	*
	*/
	getCatalogItemPrice: function(data) {
		var priceGenerator = new global.GlideappCatalogPriceGenerator(data);
		var result = {};
		result.price = priceGenerator.getPrice();
		result.price_display = priceGenerator.getDisplayPrice();

		result.recurring_price = priceGenerator.getRecurringPrice();
		result.recurring_price_display = priceGenerator.getRecurringDisplayPrice();
		result.recurring_frequency = priceGenerator.getRecurringFrequency();

		result.price_subtotal = priceGenerator.getTotal();
		result.price_subtotal_display = priceGenerator.getDisplayTotalForSession();

		result.recurring_price_subtotal = priceGenerator.getRecurringTotal();
		result.recurring_price_subtotal_display = priceGenerator.getRecurringDisplayTotalForSession();

		return result;
	},

	isMultiRowVariableSet : function(variableSetSysId) {
		if(!GlideStringUtil.isEligibleSysID(variableSetSysId))
			return false;
		var gr = new GlideRecord("item_option_new_set");
		gr.get(variableSetSysId);
		if(gr.isValid() && gr.getValue('type') == 'one_to_many')
			return true;
		return false;
	},

	findCatItemsForSpLogs : function(cartItemGr) {
		//Seperating order guides from cart items
		var items = [];
		var orderGuideObj = {};
		while(cartItemGr.next()) {
			var orderGuideKey = cartItemGr.getValue('order_guide');
			if(orderGuideKey != null) {
				if(!orderGuideObj.hasOwnProperty(orderGuideKey))
					orderGuideObj[orderGuideKey]='';
			} else
				items.push(cartItemGr.getValue('cat_item'));
		}
		return items.concat(Object.keys(orderGuideObj));
	},

	logRequestedCatItems : function(requestedCatItems, portalId) {
		for (var i = 0; i < requestedCatItems.length; i++) {
			var catItem = new sn_sc.CatItem(requestedCatItems[i]).getItemSummary(true);
			GlideSPScriptable.logStat('Cat Item Request', catItem.sys_class_name, catItem.sys_id, catItem.name, portalId);
		}
	},

	getRequestedFor: function(parentParams) {
		var gr = new GlideRecord('request_parent_mapping');
		gr.setWorkflow(false);
		var requested_for = {};
		if (!gr.get('parent_table', parentParams.sysparm_parent_table)) {
			requested_for.missing_parent_mapping = true;
			return requested_for;
		}
		var parent = new GlideRecord(parentParams.sysparm_parent_table);
		parent.get(parentParams.sysparm_parent_sys_id);
		if (JSUtil.notNil(parent.getValue(gr.requested_for_field))) {
			requested_for.id = parent.getValue(gr.requested_for_field);
			requested_for.displayValue = parent.getDisplayValue(gr.requested_for_field);
		}
		return requested_for;
	},

	//Reference Qualifer for Set field in sc_template_detail
	getMRVSVariableSetsForTemplate: function(templateGr) {
        if (!templateGr || !templateGr.cat_item)
            return 'sys_id=';

        var ans = [];
        var gr = new GlideRecord('io_set_item');
        gr.addQuery('sc_cat_item', templateGr.cat_item);
        gr.addNotNullQuery('variable_set');
        gr.addQuery('variable_set.type', 'one_to_many');
        gr.setWorkflow(false);
        gr.query();
        while (gr.next())
            ans.push(gr.getValue('variable_set'));

        return 'sys_idIN' + ans.join();
    },

	//Reference Qualifer for Question field in sc_template_detail
    getFlatQuestionsForTemplate: function(templateGr) {
        if (!templateGr || !templateGr.cat_item)
            return 'sys_id=';

        var ans = [];
        var sets = [];
        var gr = new GlideRecord('io_set_item');
        gr.addQuery('sc_cat_item', templateGr.cat_item);
        gr.addNotNullQuery('variable_set');
        gr.addQuery('variable_set.type', 'one_to_one');
        gr.setWorkflow(false);
        gr.query();
        while (gr.next())
            sets.push(gr.getValue('variable_set'));

        var qGr = new GlideRecord('item_option_new');
        qGr.addActiveQuery();
        var query = qGr.addQuery('cat_item', templateGr.cat_item);
        if (sets.length > 0)
            query.addOrCondition('variable_set', sets);
        qGr.setWorkflow(false);
        qGr.query();

        while (qGr.next())
            ans.push(qGr.getUniqueValue());

        return 'sys_idIN' + ans.join();

    },

	canUseTemplate: function(templateId){
		if (JSUtil.notNil(templateId)) {
			var template = new sn_sc.CatalogTemplate(templateId);
			var producer = template.getProducer();
			var producerItem = new sn_sc.CatItem(producer);
			if (JSUtil.notNil(producerItem))
				return producerItem.canView() && template.canUse();
		}
		return false;
	},

	canEditTemplate: function(templateId) {
		if (JSUtil.notNil(templateId)) {
			var template = new sn_sc.CatalogTemplate(templateId);
			var producer = template.getProducer();
			return this._hasTemplateManagerRoleForItem(producer);
		}
		return false;
	},

	getTemplateReadAccess: function(templateId){
		var template = new sn_sc.CatalogTemplate(templateId);
		if (JSUtil.notNil(template)) {
			var producer = template.getProducer();
			return (this.canUseTemplate(templateId) || this._hasTemplateManagerRoleForItem(producer));
		}
		return false;
	},

	_hasTemplateManagerRoleForItem: function(itemId) {
		if (JSUtil.notNil(itemId)) {
			var item = new sn_sc.CatItem(itemId);
			return item.hasTemplateManagerRole();
		}

		return false;
	},

	getCatalogBuilderEditorPersonaItemAccess: function(itemId, setId) {
		if (JSUtil.nil(itemId))
			return JSUtil.nil(setId);

		var catalogItem = new sn_sc.CatItem(itemId);
		return catalogItem.isOwner() || catalogItem.isEditableBySecondaryOwner() || this._allowItemAccessBasedOnTemplateAccess(catalogItem);
	},

    getCatalogBuilderEditorPersonaPolicyActionAccess: function(policyActionGr) {
        if (JSUtil.nil(policyActionGr))
            return false;

        var policyReferenceElement = policyActionGr.getElement('ui_policy');
        if (JSUtil.notNil(policyReferenceElement)) {
            var policyRecord = policyReferenceElement.getRefRecord();
            return JSUtil.nil(policyRecord)? false : this.getCatalogBuilderEditorPersonaItemAccess(policyRecord.getValue('catalog_item'), policyRecord.getValue('variable_set'));
        }
		return false;
	},

	getCatalogBuilderEditorPersonaQuestionChoiceAccess: function(questionChoiceGr) {
		if (JSUtil.nil(questionChoiceGr))
			return false;

		var itemOptionElement = questionChoiceGr.getElement('question');
		if (JSUtil.notNil(itemOptionElement)) {
			var itemOptionRecord = itemOptionElement.getRefRecord();
			return JSUtil.nil(itemOptionRecord) ? false : this.getCatalogBuilderEditorPersonaItemAccess(itemOptionRecord.getValue('cat_item'), itemOptionRecord.getValue('variable_set'));
		}
		return false;
	},

    _allowItemAccessBasedOnTemplateAccess: function(catalogItem) {
        return (gs.getProperty('glide.sc.builder.template_access', 'false') == 'true') && this.canUseTemplate(catalogItem.getTemplateUsed());
    },

	getCatalogWizardOrigin: function() {
		return GlideappScriptHelper.getCatalogWizardOrigin();
	},

	isVARenderTypeAvailableForItem: function(catalogItemId) {
		var gr = new GlideRecord('catalog_item_analytics');
		return gr.get('catalog_item', catalogItemId);
	},

	generateDynamicValueConfigsForCatItem: function(catItemId) {
		var catItem = new sn_sc.CatItem(catItemId);
		var questions = typeof catItem.getVariablesDynamicValueConfig == 'function' ? catItem.getVariablesDynamicValueConfig() : catItem.getVariables(false, true, false);
		return this._generateDynamicValueConfigs(questions);
    },

    generateDynamicValueConfigsForVariableSet: function(variableSetId) {
		var variableSet = new sn_sc.TableVariableSetJS(variableSetId);
		variableSet.load();
		var questions = typeof variableSet.getVariablesDynamicValueConfig == 'function' ? variableSet.getVariablesDynamicValueConfig() : variableSet.getFlatQuestions();
		return this._generateDynamicValueConfigs(questions);
    },

	_generateDynamicValueConfigs : function (questions) {
		var dynamicValueSupportedFieldsMap = {};
        for (var i = 0; i < questions.length; i++) {
            var question = questions[i];
            if (question.type == '8' || question.type == '31')
                dynamicValueSupportedFieldsMap[question.id] = question;
        }

        var dynamicVariableConfigList = [];

        var targetFieldsByTriggerField = {};

        for (var i = 0; i < questions.length; i++) {
            var questionSummary = questions[i];
            if (questionSummary.dynamic_value_field && questionSummary.dynamic_value_dot_walk_path) {

                var triggerField = questionSummary.dynamic_value_field;

				var targetField = questionSummary.id;

                if (targetFieldsByTriggerField[triggerField])
					targetFieldsByTriggerField[triggerField].push(targetField);
                else {
					targetFieldsByTriggerField[triggerField] = [];
					targetFieldsByTriggerField[triggerField].push(targetField);
                }
            }
        }

        for (var triggerField in targetFieldsByTriggerField) {
			if (dynamicValueSupportedFieldsMap[triggerField]) {
				var dynamicVariableConfig = {};
				dynamicVariableConfig['dynamicTriggerField'] = triggerField;
				dynamicVariableConfig['dynamicTargetFields'] = JSON.stringify(targetFieldsByTriggerField[triggerField]);
				dynamicVariableConfigList.push(dynamicVariableConfig);
			}
        }

        return dynamicVariableConfigList;
	},

	getEngagementChannel: function(engagementChannelOptions) {
		var engagementChannel = '';
		var portalGr = $sp.getPortalRecord();
		var isLegacyCatalog = portalGr.getValue("url_suffix") == 'catalog';
		if (engagementChannelOptions.native_mobile)
			engagementChannel = 'mobile';
		else if (engagementChannelOptions.isServiceWorkspace && !isLegacyCatalog)
			engagementChannel = 'workspace';
		else if (isLegacyCatalog)
			engagementChannel = 'legacy_catalog';
		else {
			engagementChannel = portalGr.getDisplayValue('sys_id') === '70cd9f3b734b13001fdae9c54cf6a72f' ? 'ec' : 'sp';
		}
		return engagementChannel;
    },

	moveAllCatalogAttachments: function(sourceID,targetID, attachmentTable) {
        if (!GlideStringUtil.isEligibleSysID(sourceID) || !GlideStringUtil.isEligibleSysID(targetID))
            return;

        var tableNames = ['sc_cart_item', 'ZZ_YYsc_cart_item'];
        if (!GlideStringUtil.nil(attachmentTable) && !tableNames.includes(attachmentTable))
            tableNames.push(attachmentTable);

        var gr = new GlideRecord("sys_attachment");
        gr.addQuery("table_sys_id", sourceID);
        gr.addQuery("table_name", tableNames);
        gr.setValue("table_sys_id", targetID);
        gr.updateMultiple();
	},

	deleteAttachments: function(tableName, tableID) {
		if (GlideStringUtil.nil(tableName) || !GlideStringUtil.isEligibleSysID(tableID))
			return false;

		// A bare GlideRecord('sys_attachment').deleteMultiple() evaluates no ACLs,
		// which otherwise lets any caller delete attachments on arbitrary records
		// instance-wide by controlling tableName/tableID. The parent record usually
		// doesn't exist yet (e.g. record producer attachments staged against a
		// cart item before the target record is created), so we only require
		// canWrite when a parent record is actually found.
		var parentGr = new GlideRecord(tableName);
		if (!parentGr.isValid())
			return false;

		if (parentGr.get(tableID) && !parentGr.canWrite())
			return false;

		var attachmentGr = new GlideRecord("sys_attachment");
		attachmentGr.addQuery('table_name', tableName);
		attachmentGr.addQuery('table_sys_id', tableID);
		attachmentGr.deleteMultiple();
		return true;
    },

	getVariablesPrettyNameToIDMap: function(catalogItemId) {
		var variableRecords = GlideappCatalogItem.get(catalogItemId).getVariables();
		var variableNameToIdMap = {};
		while (variableRecords.next()) {
			var _variableId = variableRecords.getValue("sys_id");
			var _variableName = variableRecords.getValue("name");
			variableNameToIdMap[_variableName] = _variableId;
		}
		return variableNameToIdMap;
	},

	setValueOnProducer : function(producer, key, value) {
		producer[key] = value;
	},

    deleteClientScripts: function(clientScriptIds) {
		return GlideappScriptHelper.deleteRecords( this.CATALOG_SCRIPT_CLIENT, clientScriptIds);
    },

    deleteUIPolicy: function(uiPolicyIds) {
        return GlideappScriptHelper.deleteRecords(this.CATALOG_UI_POLICY, uiPolicyIds);
    },

  raiseCatalogBuilderAnalyticsUsageEvent: function(params) {
        gs.eventQueue("catalog_builder_analytics.usage", null, JSON.stringify(params), null, 'sc_catalog_queue');
  },

  type: 'GlobalServiceCatalogUtil'
};
