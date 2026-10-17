var MapRelatedItemService = Class.create();
MapRelatedItemService.prototype = Object.extendsObject(MapBase, {

	initialize: function() {
		this.errorUtil = new MapErrorUtility();
		this.configUtil = new CmdbWsConfigUtils();
		this.log = new global.GSLog("com.snc.sn_cmdb_ws.log.level", this.type);
	},
	
	_getCount: function(tableName, reField, conditions, cmdbCis){
		var count = 0;
		var agg = new GlideAggregate(tableName);
		agg.addAggregate(this.COUNT);
		agg.addEncodedQuery(conditions, true);
		agg.addQuery(reField, this.IN_OP, cmdbCis);
		agg.query();
		if (agg.next())
			count = parseInt(agg.getAggregate(this.COUNT));
		return count;
	},

	_getRelatedList: function(workspaceId, configIdentifierId) {
		var relatedList = [];

		var getLabel = function(table_name) {
			var tableGr = new GlideRecord(table_name);
			return tableGr.getLabel();
		};

		var userCanReadTable = function(tableName) {
			var tableGr = new GlideRecord(tableName);
			return tableGr.canRead();
		};
		relatedList = [];
		var relatedItem = {};

		var requestObject  = {
			appId: workspaceId,
			configId: configIdentifierId,
			table: this.NODE_MAP_TABLE.RELATED_ITEM,
			orderBy: this.COL_ORDER
		};
		
		var gr = this.configUtil.getApplicationConfigTable(requestObject)
		var tmpTableName = '';
		while(gr.next()){
			tmpTableName = gr.getValue(this.COL_TABLE);
			if (!userCanReadTable(tmpTableName))
				continue;

			relatedItem = {};
			relatedItem[this.COL_NAME] = gr.getDisplayValue(this.COL_NAME);
			relatedItem[this.TABLENAME] = tmpTableName;
			relatedItem[this.TABLELABEL] = getLabel(tmpTableName);
			relatedItem[this.COL_CONDITIONS] = gr.getValue(this.COL_CONDITIONS);
			relatedItem[this.REFFIELD] = gr.getValue(this.COL_REF_FIELD);
			relatedItem[this.COL_FIELDS] = gr.getValue(this.COL_FIELDS);
			relatedItem[this.COL_SYS_ID] = gr.getValue(this.COL_SYS_ID);
			relatedItem[this.COL_SORT_FIELDS] = gr.getValue(this.COL_SORT_FIELDS);
			relatedItem[this.COL_LINK_DESTINATION] = gr.getValue(this.COL_LINK_DESTINATION);
			relatedList.push(relatedItem);
		}

		return relatedList;
	},
	
	getRelatedItemCategories: function(workspaceId, configIdentifierId) {
		try {
			var result = this._getRelatedList(workspaceId, configIdentifierId);
			return this._getOutputResponse(result);
		} catch(e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},

	_getUserPreferenceItems: function(userPreference) {
		var userPref = '';
		userPref = gs.getUser().getPreference(userPreference);
		return (global.JSUtil.nil(userPref) ? [] : this._splitIntoArray(userPref, this.COMMA_DELIMITER));
	},

	//retrieve related item list
	getRelatedList: function(workspaceId, configIdentifierId) {
		try {
			var userPrefKeys = this._buildUserPrefWithAppId([this.RELATED_LIST_EXCLUDED_ITEMS_USR_PREF_KEY, this.RELATED_LIST_SORT_ORDER_USR_PREF_KEY], workspaceId);
			var excludedRelatedItems = this._getUserPreferenceItems(userPrefKeys[this.RELATED_LIST_EXCLUDED_ITEMS_USR_PREF_KEY]);
			var sortOrderRelatedItems = this._getUserPreferenceItems(userPrefKeys[this.RELATED_LIST_SORT_ORDER_USR_PREF_KEY]);
			var output = this._getRelatedList(workspaceId, configIdentifierId);
			var excludedValues = {};
			var sortedValues = [];

			// Mark excluded values
			for (var i = 0; i < excludedRelatedItems.length; i++) {
				excludedValues[excludedRelatedItems[i]] = true;
			}

			// Filter and sort the values based on the order in sort order list
			for (var i = 0; i < sortOrderRelatedItems.length; i++) {
				var uniqueValue = sortOrderRelatedItems[i];
				var matchingObjects = output.filter(function(obj) {
				return obj.sys_id === uniqueValue && !excludedValues.hasOwnProperty(uniqueValue);
			  });
			  if (matchingObjects.length > 0) {
				sortedValues.push(matchingObjects[0]);
			  }
			}

			//Add any remaining items to the sortedValues array
			for (var i = 0; i < output.length; i++) {
				var uniqueValue = output[i].sys_id;
				var found = false;
				for (var j = 0; j < sortedValues.length; j++) {
					if (sortedValues[j].sys_id === uniqueValue) {
						found = true;
						break;
					}
				}
				if (!excludedValues.hasOwnProperty(uniqueValue) && !found) {
					sortedValues.push(output[i]);
				}
			}

			return this._getOutputResponse(sortedValues);
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},

	//retrieve related item list aggregate count
	getRelatedListAggregate: function(cmdbCis, relTableObjs) {
		var requiredProps = [this.COL_NAME, this.TABLENAME, this.REFFIELD];
		var output = [];
		var relObj = {};
		var tmpResObj = {};
		var errObj = {};
		try {
			//Input data validation
			if (!Array.isArray(cmdbCis)) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_002);
				return this._getErrorResponse(errObj);
			}
			if (global.JSUtil.nil(relTableObjs)) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_013);
				return this._getErrorResponse(errObj);
			}

			for(var i = 0; i < relTableObjs.length; i += 1) {
				relObj = relTableObjs[i];
				tmpResObj = {};
				if (this._hasAllProperty(requiredProps, relObj)) {
					var count = this._getCount(
						relObj.tableName, relObj.referenceField, relObj.conditions, cmdbCis);
					tmpResObj[this.COL_NAME] = relObj.name;
					tmpResObj[this.TABLENAME] = relObj.tableName;
					tmpResObj[this.COL_SYS_ID] = relObj.sys_id;
					tmpResObj[this.COUNT.toLowerCase()] = count;
					tmpResObj[this.ARIA_LABEL] = gs.getMessage("{0} with {1} {2}", [relObj.name, count.toString(), count > 1 ? gs.getMessage("items") : gs.getMessage("item")]);
					output.push(tmpResObj);
				} else {
					return this._validateInputObj(relObj, requiredProps);
				}
			}
			return this._getOutputResponse(output);
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},

	//retrieve the given related table details
	getRelatedItemData: function(payload) {
		var records = {};
		var errObj = {};
		var pThis = this;
		//Input data validation
		if (this._isEmptyObj(payload)) {
			errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_014);
			return this._getErrorResponse(errObj);
		} else if (!payload[pThis.ALL_NODES] && global.JSUtil.nil(payload[this.CI_LIST]) || this._isEmptyArray(payload[this.CI_LIST])) {
			errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_002);
			return this._getErrorResponse(errObj);
		}

		//When getting all the related items for all nodes
		if(payload[pThis.ALL_NODES])
			for(var i=0; i < payload[pThis.ALL_NODES].length; i++) {
				var config = {
					"relatedItemCategorySysId": [],
					"ciList": [payload[pThis.ALL_NODES][i]],
					"workspaceId": payload.workspaceId,
					"configIdentifierId": payload.configIdentifierId
				};
				var result = pThis._getRelatedItemDataValue(config);
				records[payload[pThis.ALL_NODES][i]] = result;
			}
		else {
			var output = pThis._getRelatedItemDataValue(payload);
			return this._getOutputResponse(output);
		}
        return this._getOutputResponse(records);

	},

	_getRelatedItemDataValue: function(config) {
		var records = {};
		var errObj = {};
		try{
			var requestObject  = {
				appId: config.workspaceId,
				configId: config.configIdentifierId,
				table: this.NODE_MAP_TABLE.RELATED_ITEM
			};
			var categoryGr = this.configUtil.getApplicationConfigTable(requestObject)
			while (categoryGr.next()) {
				//Skip excluded values
				var userPrefKeys = this._buildUserPrefWithAppId([this.RELATED_LIST_EXCLUDED_ITEMS_USR_PREF_KEY], config.workspaceId);
				if(!config.relatedItemCategorySysId && this._getUserPreferenceItems(userPrefKeys[this.RELATED_LIST_EXCLUDED_ITEMS_USR_PREF_KEY]).includes(categoryGr.getUniqueValue())) {
					continue;
				}

				// fetch the actual related records for the category
				var gr = new GlideRecordSecure(categoryGr.getValue(this.COL_TABLE));
				gr.addEncodedQuery(categoryGr.getValue(this.COL_CONDITIONS));
				gr.addQuery(categoryGr.getValue(this.COL_REF_FIELD), this.IN_OP, config.ciList);
				if (config.sortDirection && config.sortField) {
					if ((config.sortDirection + "").toLowerCase() === this.SORT_DESC)
						gr.orderByDesc(config.sortField + "");
					else
						gr.orderBy(config.sortField + "");
				} else {
					gr.orderByDesc(categoryGr.getValue(this.COL_NUMBER_FIELD));
				}
				if (config.startIndex && config.endIndex)
					gr.chooseWindow(config.startIndex, config.endIndex);

				gr.query();
				var ciSysIdField = categoryGr.getValue(this.COL_REF_FIELD);
				var table = categoryGr.getValue(this.COL_TABLE);
				var fields = categoryGr.getValue(this.COL_FIELDS);
				var footerField = categoryGr.getValue(this.COL_FOOTER_FIELD);
				var titleField = categoryGr.getValue(this.COL_TITLE_FIELD);
				var numberField = categoryGr.getValue(this.COL_NUMBER_FIELD);
				var timelineDateField = categoryGr.getValue(this.COL_DATE_FIELD);
				var timelineEndDateField = categoryGr.getValue(this.COL_END_DATE_FIELD);
				var timelineIcon = categoryGr.getValue(this.COL_TIMELINE_ICON);
				var timelineHighlightField = categoryGr.getDisplayValue(this.COL_TIMELINE_HIGHLIGHT_FIELD);
				var linkDestination = categoryGr.getValue(this.COL_LINK_DESTINATION);
				var cardName = categoryGr.getValue(this.COL_TITLE_FIELD);

				// construct each card object and add a flat properties object for sorting and searching
				while(gr.next()) {
					var linkParams = { table: table, sysid: gr.getValue(this.COL_SYS_ID) };
					var relatedItemRecord = { 
						title: gr.getDisplayValue(titleField),
						number: gr.getValue(numberField),
						aria: {
							"aria-label": gs.getMessage("{0} opens a related item form", gr.getValue(numberField))
						},
						table: table,
						sysId: gr.getValue(this.COL_SYS_ID),
						ciSysId: gr.getValue(ciSysIdField),
						fields: [],
						properties: {},
						linkDestination: linkDestination.replace(/\${(\w+)}/g, function (_, v) { return linkParams[v]; }),
						timeline: {},
						cardName: gs.getMessage("{0} related item card", gr.getDisplayValue(cardName))
					};
					// get the highlighted values
					var tmpResult = this._extractFieldValues(table, fields, gr);
					Object.keys(tmpResult).forEach(function(key) {
						if (key === timelineHighlightField)
							relatedItemRecord.timeline.timelineHighlight = tmpResult[key];

						relatedItemRecord.fields.push(tmpResult[key]);
					}),
					relatedItemRecord.properties[titleField] = gr.getDisplayValue(titleField);
					relatedItemRecord.properties[numberField] = gr.getDisplayValue(numberField);
					if (footerField) {
						relatedItemRecord.footer = {
							name: gr[footerField].getLabel() + ": ",
							value: gr.getDisplayValue(footerField)
						};
						relatedItemRecord.properties[footerField] = gr.getDisplayValue(footerField);
					}
					var fieldsArray = fields.split(',');
					for (var i = 0; i < fieldsArray.length; i++) {
						var element = gr.getElement(fieldsArray[i]);
						relatedItemRecord.properties[fieldsArray[i]] = "";
						if (element.getED().isChoiceTable()) {
							// if it's a choice list, make sure that the actual value is included for sorting
							relatedItemRecord.properties[fieldsArray[i]] += gr.getValue(fieldsArray[i]) + " ";
						}
						relatedItemRecord.properties[fieldsArray[i]] += gr.getDisplayValue(fieldsArray[i]);
					}
					// populate timeline values
					var stringDate = gr.getValue(timelineDateField);
					if (stringDate) {
						relatedItemRecord.timeline[this.COL_DATE_FIELD] = new GlideDateTime(stringDate).getNumericValue();
					}
					var stringEndDate = gr.getValue(timelineEndDateField);
					if (stringEndDate) {
						relatedItemRecord.timeline[this.COL_END_DATE_FIELD] = new GlideDateTime(stringEndDate).getNumericValue();
					}
					relatedItemRecord.timeline[this.COL_TIMELINE_ICON] = timelineIcon;
					relatedItemRecord.timeline[this.TIMELINE_LEGEND_CATEGORY] = categoryGr.getDisplayValue(this.COL_NAME);
					if (!records[categoryGr.getUniqueValue()])
						records[categoryGr.getUniqueValue()] = [];
					records[categoryGr.getUniqueValue()].push(relatedItemRecord);
				}
			}
			return records;
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},

	_validateInputObj: function(obj, requiredKeys) {
		var pThis = this;
		var errResponse = {};
		var errObj = {};
		requiredKeys.forEach(function (key) {
			if (!pThis._hasProperty(key, obj) || pThis._isEmpty(obj[key])) {
				errObj = pThis.errorUtil._form40XErrorObject(pThis._mapErrorCode(key));
				errResponse = pThis._getErrorResponse(errObj);
				return;
			}
		});
		//return error response if validation fails
		if (!this._isEmptyObj(errResponse))
			return errResponse;
	},

	_validateCiList: function(cmdbCis) {
		var errObj = {};
		if (this._isEmptyArray(cmdbCis)) {
			errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_002);
			return this._getErrorResponse(errObj);
		}
	},

	_mapErrorCode: function(field) {
		switch(field) {
			case this.CI_LIST:
				return this.errorUtil.CMDBUM_400_002;
			case this.TABLENAME:
				return this.errorUtil.CMDBUM_400_005;
			case this.COL_NAME:
				return this.errorUtil.CMDBUM_400_006;
			case this.REFFIELD:
				return this.errorUtil.CMDBUM_400_007;
			case this.SORT_DIR:
				return this.errorUtil.CMDBUM_400_010;
			case this.SORT_FIELD:
				return this.errorUtil.CMDBUM_400_009;
			case this.COL_FIELDS:
				return this.errorUtil.CMDBUM_400_008;
			case this.START_INDEX:
				return this.errorUtil.CMDBUM_400_011;
			case this.END_INDEX:
				return this.errorUtil.CMDBUM_400_012;
			default:
				return this.errorUtil.CMDBUM_500_001;
		}
	},

    _buildUserPrefWithAppId: function(keys, appId) {
        var userPrefKeys = {};
        keys.forEach(function(key) {
            userPrefKeys[key] = key + "_" + appId;
        });
        return userPrefKeys;
    },

    type: 'MapRelatedItemService'
});
