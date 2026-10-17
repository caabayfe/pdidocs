var related_list_edit_helper = Class.create();
related_list_edit_helper.prototype = {
	initialize: function () { },

	isSecurityChecksEnabled : function(){
		return GlideProperties.getBoolean('glide.mra.related_list.enforce_acl', true);
	},
	create: function ( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
		var requestJson = this.getJsonBody(request);
		if (response.getStatusCode === 400)
			return;
		var jsonResponse = {
			result: [],
			contextId: "",
		};
		// Moved logic of adding records to flow action 1df72eef93041a107f243edeb189181b
		var mra = sn_fd.FlowAPI.getRunner().subflow("multi_record_associator_flow");
		try {
			if (requestJson.asyncOperation) {
				// Running flow in Background
				jsonResponse.contextId = mra.inBackground().withInputs({ "request": requestJson }).run().getContextId();

			} else {
				jsonResponse = this.processMRARecords(requestJson);
			}
			this.setResponse(response, jsonResponse);
		} catch (e) {
			response.setStatus(400).setResponse(e);
		}
	},

	setResponse: function ( /*RESTAPIResponse*/ response, responseObj) {
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(responseObj);
	},
	getJsonBody: function ( /*RESTAPIRequest*/ request) {
		var body = "";
		var json = "";
		try {
			var requestBody = request.body;
			var requestString = requestBody.dataString;
			return JSON.parse(requestString);
		} catch (e) {
			response.setStatus(400);
			var msg = gs.getMessage("CRUD operation failed: {0}", e);
			throw new sn_ws_err.BadRequestError(msg);
		}
	},
	getDisplayNames: function (table, sysIds) {

		var displayNames = {};
		var displayGR = "";
		if(this.isSecurityChecksEnabled()){
			displayGR = new GlideRecordSecure(table);
			displayGR.addEncodedQuery("sys_idIN"+sysIds, true);
		} else {
			displayGR = new GlideRecord(table);
			displayGR.addQuery("sys_id", "IN", sysIds.join());
		}
		displayGR.query();
		while (displayGR.next()) {
			displayNames[displayGR.getValue("sys_id")] = displayGR.getDisplayValue() || displayGR.getValue("sys_id");
		}

		return displayNames;
	},

	initializeExtPointImpl: function (extPointKey, reqBody) {
		try {

			var upep = new GlideScriptedExtensionPoint().getExtensions('RelatedListItemUpdateHandler'); //Update Handler Extension Point
			for (var i = 0; i < upep.length; i++) {
				if (upep[i].handles(extPointKey)) {
					this.extPoint = upep[i];
					this.extPoint.initialize && this.extPoint.initialize(reqBody);
					break;
				}
			}

			var cfep = new GlideScriptedExtensionPoint().getExtensions('RelatedListItemCandidateFilter'); //CandidateFilterExtensionPoint
			for (var j = 0; j < cfep.length; j++) {
				if (cfep[j].handles(extPointKey)) {
					this.cfExtPoint = cfep[j];
					this.cfExtPoint.initialize && this.cfExtPoint.initialize(reqBody.m2mTableName, reqBody.parentFieldName, reqBody.parentRecordSysId, reqBody.referencedFieldName);
					break;
				}
			}

		} catch (e) {
			gs.error("Error running RelatedListItemUpdateHandler extension point", e);
		}
	},

	postUpdate: function (reqBody) {
		if (this.extPoint) {
			this.extPoint.postUpdate && this.extPoint.postUpdate(reqBody);
		}
	},
	processMRARecords: function (requestJson) {
		var asyncProperties = requestJson.asyncProperties;
		var appliedFilter = requestJson.appliedFilter;
		var m2mQuery = requestJson.newItemsQuery;
		var userGivenTable = requestJson.userGivenTable;
		var parentRecordSysId = requestJson.parentRecordSysId;
		var parentFieldName = requestJson.parentFieldName;
		var referencedFieldName = requestJson.referencedFieldName;
		var m2mTableName = requestJson.m2mTableName;
		var type = requestJson.type;
		var channel = requestJson.channel;
		var extPointKey = requestJson.extensionPoint;
		var asyncOperation = requestJson.asyncOperation;
		var relatedListName = requestJson.relatedListName;
		var itemFilterQuery;

		var result = {
			"success": 0,
			"successRecords":[],
			"error": []
		};
		var errorRecords = [];
		try {

			// pre-hook: initialize extension point
			this.initializeExtPointImpl(extPointKey, requestJson);

			var filterQuery = this.cfExtPoint.getFilterQuery(m2mTableName, parentFieldName, parentRecordSysId, referencedFieldName);
			if(requestJson.editableFilter){
				itemFilterQuery = appliedFilter;
			} else{
	    			itemFilterQuery = appliedFilter ? (filterQuery  ? filterQuery + "^" + appliedFilter : appliedFilter) : filterQuery;
			}

			var enforceSecureInsert = GlideProperties.getBoolean('glide.mra.related_list.enforce_acl', true);

			var gr = "";
			if(this.isSecurityChecksEnabled()) {
				gr = new GlideRecordSecure(userGivenTable);
				gr.addEncodedQuery(itemFilterQuery, true);
				gr.addEncodedQuery(m2mQuery, true);
			} else {
				gr = new GlideRecord(userGivenTable);
				gr.addQuery(itemFilterQuery);
				gr.addQuery(m2mQuery);
			}
			gr.query();

			// for each new item, create a new record in the m2m table
			if (type === 'm2m') {
				while (gr.next()) {
					// Once all downstream BUs with the improper ACLs fix their application code, we can remove this conditional logic and insecure insertion
					if(this.isSecurityChecksEnabled())
						this._addRelatedRecordsSecure(m2mTableName, parentFieldName, parentRecordSysId, referencedFieldName, gr, errorRecords, result);
					else
						this._addRelatedRecords(m2mTableName, parentFieldName, parentRecordSysId, referencedFieldName, gr, errorRecords, result);
				}

				if (errorRecords.length) {
					var existing = [];
					var grd = "";
					if(this.isSecurityChecksEnabled()){
						grd = new GlideRecordSecure(m2mTableName);
						grd.addUserQuery(referencedFieldName, 'IN', errorRecords.join());
					} else{
						grd = new GlideRecord(m2mTableName);
						grd.addQuery(referencedFieldName, 'IN', errorRecords.join());
					}
					
					grd.query();
					while (grd.next()) {
						existing.push(grd.getValue(referencedFieldName));
					}

					var recordName = this.getDisplayNames(userGivenTable, errorRecords);


					for (var record = 0; record < errorRecords.length; record++) {
						var errorObj = {};
						if (existing.includes(errorRecords[record])) {
							errorObj = {
								"status": "RECORD_ALREADY_AVAILABLE",
								"record": recordName[errorRecords[record]]
							};
						} else {
							gs.error("Something went wrong Unable to insert record", errorRecords[record]);
							errorObj = {
								"status": "UNKNOWN_ERROR",
								"record": recordName[errorRecords[record]]
							};
						}
						result.error.push(errorObj);
					}
				}

			} else if (type === 'o2m') {
				var updateSysIds = [];
				while (gr.next()) {
					var parentTable = gr[parentFieldName].getReferenceTable();
					if (gr.canWrite() || new global.BulkAddRecords().canRelateRecord(parentTable, gr, parentFieldName)) {
						updateSysIds.push(gr.getUniqueValue());
						result.success++;
					} else {
						gs.error("User don't have access to add", gr.getUniqueValue());
						var o2mError = {
							"status": "RECORD_NOT_FOUND",
							"record": gr.getUniqueValue()
						};
						result.error.push(o2mError);
					}
				}
				var grUpdate = new GlideRecordSecure(userGivenTable);
				grUpdate.addQuery(itemFilterQuery);
				grUpdate.addQuery('sys_idIN' + updateSysIds.toString());
				grUpdate.query();
				//DEF0624583: iterate through records so ACL's apply at the record level (rather than at table level)
				while (grUpdate.next()) {
					var recordSysId = grUpdate.getUniqueValue();
					var updateError = { record: recordSysId };
					var updateSuccess = true;
					
					if (!grUpdate[parentFieldName].canWrite()) {
						// User does not have write access to field
						gs.error("User doesn't have write access to field: " + parentFieldName);
						updateError.status = "FIELD_WRITE_ACCESS_DENIED";
						updateSuccess = false;
					} else {
						// User has write access, update record.
				grUpdate.setValue(parentFieldName, parentRecordSysId);
						var updateStatus = grUpdate.update();
						
						if (gs.nil(updateStatus)) {
							// Error with updating record
							gs.error("Error has occurred while updating " + recordSysId);
							updateError.status = "UNKNOWN_ERROR";
							updateSuccess = false;
						}
					}

					if (!updateSuccess) {
						result.success = result.success ? --result.success : -1;
					result.error.push(updateError);
				}
			}
			}
			// post-hook: call postUpdate method from ext point
			this.postUpdate(requestJson);
			result.asyncProperties = asyncProperties;
			result.relatedListName = relatedListName;
			if (asyncOperation)
				gs.publishToUser(channel, {
					status: "COMPLETED",
					result: result
				}, gs.getUserName());
			else{
				return result;
			}
		} catch (e) {
			result.error.push({
				"status": "UNKNOWN_ERROR",
				"record": e
			});
			if (asyncOperation)
				gs.publishToUser(channel, {
					status: "COMPLETED",
					result: result
				}, gs.getUserName());
			gs.error("Error while processing multi record associater ", e);
		}
	},
	_addRelatedRecords: function(m2mTableName, parentFieldName, parentRecordSysId, referencedFieldName, gr, errorRecords, result) {
		var m2m = new GlideRecord(m2mTableName);
		if (m2m.canCreate() || m2m.canWrite()) {
			m2m.initialize();
			m2m.setValue(parentFieldName, parentRecordSysId);
			m2m.setValue(referencedFieldName, gr.getUniqueValue());
			var insertResult = m2m.insert();

			if (!insertResult && m2m.getLastErrorMessage()) {
				errorRecords.push(gr.getUniqueValue());
			} else {
				result.success++;
				result.successRecords.push(m2m.getUniqueValue());
			}

		} else {
			var displayName = this.getDisplayNames(userGivenTable, [gr.getUniqueValue()]);
			var error = {
				"status": "RECORD_NOT_FOUND",
				"record": displayName
			};
			result.error.push(error);
		}
	},
	_addRelatedRecordsSecure: function(m2mTableName, parentFieldName, parentRecordSysId, referencedFieldName, gr, errorRecords, result) {
		var m2m = new GlideRecordSecure(m2mTableName);

		m2m.initialize();
		m2m.setValue(parentFieldName, parentRecordSysId);
		m2m.setValue(referencedFieldName, gr.getUniqueValue());
		var insertResult = m2m.insert();

		if (!insertResult && m2m.getLastErrorMessage()) {
			errorRecords.push(gr.getUniqueValue());
		} else {
			result.success++;
			result.successRecords.push(m2m.getUniqueValue());
		}
	},
	type: 'related_list_edit_helper'
};
