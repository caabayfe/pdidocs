var RestCatalogUtil = Class.create();
RestCatalogUtil.prototype = {
    initialize: function() {
    },

	getClientScripts: function(itemId, uiType) {
		var onLoad = [];
		var onChange = [];
		var onSubmit = [];
		var resp = {};
		var viewType = '0';//desktop view type by default

		var globalSCatUtil = new global.GlobalServiceCatalogUtil();
		var scripts = new GlideRecord('catalog_script_client');
		scripts.addActiveQuery();
		scripts.addQuery('cat_item', itemId);
		scripts.query();
		if(uiType == 'mobile')
			viewType = '1';
		else if(uiType == 'both')
			viewType = '10';

		while (scripts.next()) {
			if(scripts.getValue('ui_type') !== '10' && scripts.getValue('ui_type') !== viewType)
					continue;
			var type = scripts.type;
			if (type == 'onLoad') {

				var load_obj = {};
				load_obj.appliesTo = scripts.applies_to+'';
				load_obj.condition = scripts.condition+'';
				load_obj.type = scripts.type+'';
				load_obj.script = globalSCatUtil.stripScriptComments(scripts.script+'');
				load_obj.fieldName = scripts.cat_variable+'';
				load_obj.variable_set = scripts.variable_set+'';
				load_obj.ui_type = scripts.getDisplayValue('ui_type');
				load_obj.sys_id = scripts.sys_id+'';

				onLoad.push(load_obj);

			} else if (type  == 'onChange') {

				var change_obj = {};
				change_obj.appliesTo = scripts.applies_to+'';
				change_obj.condition = scripts.condition+'';
				change_obj.type = scripts.type+'';
				change_obj.script = globalSCatUtil.stripScriptComments(scripts.script+'');
				change_obj.fieldName = scripts.cat_variable+'';
				change_obj.variable_set = scripts.variable_set+'';
				change_obj.ui_type = scripts.getDisplayValue('ui_type');
				change_obj.sys_id = scripts.sys_id+'';

				onChange.push(change_obj);

			} else if (type == 'onSubmit') {

				var submit_obj = {};
				submit_obj.appliesTo = scripts.applies_to+'';
				submit_obj.condition = scripts.condition+'';
				submit_obj.type = scripts.type+'';
				submit_obj.script = globalSCatUtil.stripScriptComments(scripts.script+'');
				submit_obj.fieldName = scripts.cat_variable+'';
				submit_obj.variable_set = scripts.variable_set+'';
				submit_obj.ui_type = scripts.getDisplayValue('ui_type');
				submit_obj.sys_id = scripts.sys_id+'';

				onSubmit.push(submit_obj);

			}
		}

		resp['onChange'] = onChange ;
		resp['onSubmit'] = onSubmit;
		resp['onLoad'] = onLoad;
		return resp;
	},

	checkMandatoryVariables: function(itemId, variables) {
		variables = variables || {};
		var varGr = new GlideRecord('item_option_new');
		var qr = varGr.addQuery('cat_item', itemId);
		var variableSet = new sn_sc.CatItem(itemId).getVariableSet();
		if (variableSet.length > 0) {
			var qr2 = qr.addOrCondition("variable_set", variableSet);
			qr2.addCondition("variable_set.type", "one_to_one");
		}
		varGr.addActiveQuery();
		varGr.addQuery('mandatory', true);
		varGr.query();
		while (varGr.next()) {
			if ((varGr.type == 7 && variables[varGr.getValue('name')] != 'true') || !variables[varGr.getValue('name')])
				return false;
		}
        return this.checkMandatoryVariablesForMRVS(variables, variableSet);
	},

	checkMandatoryVariablesForMRVS: function(variables, variableSet) {
		if (!variableSet || variableSet.length <= 0)
			return true;

		var varGr = new GlideRecord('item_option_new');
		var qr = varGr.addQuery("variable_set", variableSet);
		qr.addCondition("variable_set.type", "one_to_many");
		varGr.addActiveQuery();
		varGr.addQuery('mandatory', true);
		varGr.query();
		while (varGr.next()) {
			var varSetName = varGr.variable_set.internal_name.toString();
			var mrvs = variables[varSetName];
			if (!mrvs)
				continue;
			var rowArray;
			try {
				rowArray = JSON.parse(mrvs);
			} catch (e) {
				gs.debug(e);
			}
			if (!(rowArray instanceof Array))
				throw new sn_ws_err.BadRequestError("Value for Multi Row Variable '" + varSetName + "' should be a JSONArray string");

			var varName = varGr.getValue('name');
			for (i = 0; i < rowArray.length; i++) {
				if ((varGr.type == 7 && rowArray[i][varName] != 'true') || !rowArray[i][varName])
					return false;
			}
		}
		return true;
	},

	isValidItem: function(itemId, type) {
		type = type || 'sc_cat_item';
		var gr = new GlideRecord(type);

		if(gr.get(itemId))
			return true;
		else
			return false;
	},

	canAddItemToWishlist: function(cat_item_id) {
		var catItemCatalogM2M = new GlideRecord("sc_cat_item_catalog");
		catItemCatalogM2M.addQuery("sc_cat_item", cat_item_id);
		catItemCatalogM2M.addQuery("sc_catalog.enable_wish_list", true);
		catItemCatalogM2M.query();
		if (catItemCatalogM2M.next())
			return true;
		return false;

	},

	validateVariableRegex: function(itemId, variables) {
        var valMessages = [];
        var regexMap = {};
        variables = variables || {};
        //Retrieving all the related var set info
        var catalogItem = new sn_sc.CatItem(itemId);
		var mrVarSetNames = {};
        //Retireving required vars regex info
        var variableKeys = catalogItem.getVariableKeys(0); //0 for mode any
        for (var i = 0; i < variableKeys.length; i++) {
            var questionId = variableKeys[i];
            var question = GlideappQuestion.getQuestion(questionId);
			if (question == null || !question.isValidQuestion()) {
				gs.debug("RestCatalogUtil: Invalid question definition, skipping regex validation for question with sys_id "+ questionId);
				continue;
			}
            //Retrieving the multi row var set names
            var vsetName = question.getVSetName().toString();
            var vsetType = question.getVSetType().toString();
            if (vsetName && vsetType == "one_to_many" && !mrVarSetNames[vsetName]) {
				mrVarSetNames[vsetName] = vsetType;
            }
            if ((question.getType() == 6 || question.getType() == 16) && question.getRegex()) {
                regexMap[question.getName()] = {
                    "valMessage": question.getValidationMessage(),
                    "sys_id": question.getId()
                };
            }
        }
        var varKeys = Object.keys(variables);
        for (var i = 0; i < varKeys.length; i++) {
            var varName = varKeys[i];
            var varValue = variables[varName];
            if (this._containsElement(Object.keys(mrVarSetNames), varName)) {
                this._processMRVSetVarsRegexValidation(varValue, regexMap, valMessages);
            } else {
                if (regexMap[varName]) {
                    var question = GlideappQuestion.getQuestion(regexMap[varName].sys_id);
                    if (!question.validateRegex(varValue))
                        valMessages.push(question.getLabel() + ": " + regexMap[varName]["valMessage"]);
                }
            }
        }
        return valMessages;
    },

    _processMRVSetVarsRegexValidation: function(mrSetValue, regexMap, valMessages) {
		if (mrSetValue === "")
			return;

		var rowArray = JSON.parse(mrSetValue);
		for(var i = 0; i < rowArray.length; i++) {
			var rowObj =  rowArray[i];
			var varKeys = Object.keys(rowObj);
			for(var j = 0; j < varKeys.length; j++) {
				var currVarName = varKeys[j];
				var currVarValue = rowObj[currVarName];
				if(regexMap[currVarName]) {
					var question = GlideappQuestion.getQuestion(regexMap[currVarName].sys_id);
					if (!question.validateRegex(currVarValue))
						valMessages.push(currVarName + ": " + regexMap[currVarName]["valMessage"]);
				}
			}
		}
	},

	validateMaxRowCountMultiRowVS: function(srcTable, srcId, itemId, variablesData, translate) {
        var valMessages = [];
        variablesData = variablesData || {};
        var mrVarSetIdtoNameMap = {};
        //Retrieving all the related var set info
        var catalogItem = new sn_sc.CatItem(itemId);
		var variableKeys = catalogItem.getVariableKeys(0); //0 for mode any
        for (var i = 0; i < variableKeys.length; i++) {
            var question = GlideappQuestion.getQuestion(variableKeys[i]);
			if (question == null || !question.isValidQuestion()) {
				gs.debug("RestCatalogUtil: Invalid question definition, skipping max row validation for question with sys_id "+ variableKeys[i]);
				continue;
			}
            //Retrieving the multi row var set names
            var vsetName = question.getVSetName().toString();
            var vsetType = question.getVSetType().toString();
            if (vsetName && vsetType == "one_to_many" && !mrVarSetIdtoNameMap[vsetName]) {
				mrVarSetIdtoNameMap[vsetName] =  question.getVSetId();
            }
        }

        var globalCatalogUtil = new global.GlobalServiceCatalogUtil();
        var varKeys = Object.keys(variablesData);
        for (var i = 0; i < varKeys.length; i++) {
            var varName = varKeys[i];
            var varValue = variablesData[varName];
            if (mrVarSetIdtoNameMap[varName] && varValue != '') {
                var rowArray = JSON.parse(varValue);
                var rowCount = rowArray.length;
                var rowLimit = globalCatalogUtil.getMaxRowCountMultiRowVS(mrVarSetIdtoNameMap[varName], srcTable, srcId);
                if (rowCount > rowLimit) {
                    valMessages.push(!translate
									 ? 'The maximum rows specified in the multi-row variable set ' + varName + ' attribute exceeds the system limit.'
									 : gs.getMessage('The maximum rows specified in the multi-row variable set {0} attribute exceeds the system limit.', varName));
                }
            }
        }
        return valMessages;
    },

    _containsElement: function(array, element) {
		for(var i = 0; i < array.length; i++ ) {
			if(array[i] === element)
				return true;
			}
		return false;
	},

	getQuestionType: function(itemId, questionName) {
		var catalogItem = new sn_sc.CatItem(itemId);
		if (catalogItem) {
			var variableKeys = catalogItem.getVariableKeys(0);
			for (var i = 0; i < variableKeys.length; i++) {
				var question = GlideappQuestion.getQuestion(variableKeys[i]);
				if (question && question.getName() == questionName)
					return question.getType();
			}
		}
		return -1;
	},

	getFieldValueAsString: function(key, value, itemId) {
		if (Array.isArray(value) && this.getQuestionType(itemId, key) == 21)
			return value.toString();
		else
			return JSON.stringify(value);
	},

    type: 'RestCatalogUtil'
};
