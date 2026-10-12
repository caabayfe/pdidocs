var StdChangeUtilsSNC = Class.create();
StdChangeUtilsSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	TABLE_NAME_CHANGE: 'change_request',
	TABLE_NAME_CHANGE_TASK: 'change_task',
	TABLE_NAME_PROPOSAL: 'std_change_proposal',
	TABLE_NAME_VERSION: 'std_change_producer_version',
	TABLE_NAME_TEMPLATE: 'std_change_template',
	TABLE_NAME_PRODUCER: 'std_change_record_producer',
	TABLE_NAME_RELATED_TASK: 'std_change_proposal_task',
	TABLE_NAME_PROPERTIES: 'std_change_properties',
	TABLE_NAME_CATALOG: 'sc_catalog',
	TABLE_NAME_CATEGORY: 'sc_category',
	DEFAULT_CHG_TYPE: 'standard',
	DEFAULT_CHG_MODEL: 'e55d0bfec343101035ae3f52c1d3ae49',
	APP_MODULE_STD_CHG_CAT: '022f2aa293b002002dcef157b67ffb15',
	ATTR_SYS_ID: 'sys_id',
	ATTR_CATALOG: 'catalog',
	ATTR_CATEGORY: 'category',
	ATTR_CLOSE_CODE: 'close_code',
	ATTR_STD_CHG_PRODUCER: 'std_change_producer',
	ATTR_STATE: 'state',
	ATTR_STD_CHG_PRODUCER_VERSION: 'std_change_producer_version',
	ATTR_TYPE: 'type',
	ATTR_CHG_MODEL: 'chg_model',
	ATTR_INTERNAL_NAME: 'internal_name',
	INTERCEPTOR_STD_CHG: '8db74e90c611227400d47c65b1076db8',
	PROP_ROW_KEY: 'main_config',
	PROP_MANDATORY_FIELDS: 'mandatory_fields',
	PROP_UNMODIFIABLE_FIELDS: 'restricted_fields',
	PROP_FIELDS_TO_COPY: 'fields_to_copy',
	PROP_DEFAULT_VALUES: 'default_values',
	PROP_READONLY_FIELDS: 'readonly_fields',
	PROP_TWO_STEP: 'two_step',
	SYS_PROP_PREVENT_INACTIVE_INSERT: 'com.snc.change_request.standard_change.abort_insert_inactive_template',
	PROPOSE_STD_CHANGE_RP_NEW: 'cb2a927f935002003b7a7a75e57ffb4c',
	PROPOSE_STD_CHANGE_RP_MODIFY: '32b19f3b9fb002002920bde8132e7024',
	PROPOSE_STD_CHANGE_RP_RETIRE: '011f117a9f3002002920bde8132e7020',
	ROLE_CHG_MANAGER: 'change_manager',
	STATE_NEW: 1,
	STATE_WIP: 2,
	STATE_CLOSED: 3,
	STATE_CANCELLED: 4,
	PROPOSAL_TYPE_NEW: 1,
	PROPOSAL_TYPE_MODIFY: 2,
	PROPOSAL_TYPE_RETIRE: 3,
	APPROVAL_STATE_NOT_REQUESTED: 'not requested',
	APPROVAL_STATE_APPROVED: 'approved',
	APPROVAL_STATE_REJECTED: 'rejected',
	CLOSE_CODES_UNSUCCESSFUL: ['unsuccessful'],

	initialize: function(request, responseXML, gc) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
		this.log = new GSLog('com.snc.std_change_request.log', 'StdChangeUtilsSNC');
		this.arrayUtil = new ArrayUtil();
		this.TABLE_LABEL_CHANGE = new GlideRecord(this.TABLE_NAME_CHANGE).getLabel();
	},

	isNew: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.state - 0 === this.STATE_NEW;
	},

	isWIP: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.state - 0 === this.STATE_WIP;
	},

	isClosed: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.state - 0 === this.STATE_CLOSED;
	},

	isCancelled: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.state - 0 === this.STATE_CANCELLED;
	},

	isNewTemplate: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.proposal_type - 0 === this.PROPOSAL_TYPE_NEW;
	},

	isModifyTemplate: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.proposal_type - 0 === this.PROPOSAL_TYPE_MODIFY;
	},

	isRetireTemplate: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.proposal_type - 0 === this.PROPOSAL_TYPE_RETIRE;
	},

	isApproved: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.approval + "" === this.APPROVAL_STATE_APPROVED;
	},

	isRejected: function(proposalGr) {
		if (!this._isValidRecord(proposalGr))
			return false;
		return proposalGr.approval + "" === this.APPROVAL_STATE_REJECTED;
	},

	ajaxFunction_isProposalApproved: function() {
		var proposalId = this.getParameter('sysparm_proposalSysId');
		if (!proposalId)
			return false;

		var gr = new GlideRecordSecure(this.TABLE_NAME_PROPOSAL);
		if (gr.get(proposalId))
			return this.isApproved(gr);

		return false;
	},

	ajaxFunction_isProposalRejected: function() {
		var proposalId = this.getParameter('sysparm_proposalSysId');
		if (!proposalId)
			return false;


		var gr = new GlideRecordSecure(this.TABLE_NAME_PROPOSAL);
		if (gr.get(proposalId))
			return this.isRejected(gr);

		return false;
	},

	_isValidRecord: function(proposalGr) {
		return proposalGr && proposalGr.isValid();
	},

	_createRecordProducerAndVersion: function(proposalGr, templateId) {
		var gr = new GlideRecord(this.TABLE_NAME_PRODUCER);
		gr.initialize();
		gr.name = proposalGr.template_name;
		gr.short_description.setDisplayValue(proposalGr.short_description.getDisplayValue());
		gr.category = proposalGr.category;
		gr.sc_catalogs = proposalGr.catalog;
		gr.template = templateId;
		var producerId = gr.insert();
		if (producerId) {
			var proposalId = proposalGr.getUniqueValue();
			var versionId = this._createVersion(producerId, proposalId);
			gr.script = this._createScriptContent(versionId, producerId);
			gr.current_version = versionId;
			gr.update();
			this._copyAttachments(proposalGr, producerId);
			return versionId;
		} else
			this.log.logErr('Record Producer and version could not be created for the proposal' + proposalGr.getUniqueValue());
	},

	_copyAttachments: function(srcGr, targetSysId) {
		var res = [];
		if (srcGr.hasAttachments())
			res = j2js(GlideSysAttachment.copy(srcGr.getTableName(), srcGr.getUniqueValue(), this.TABLE_NAME_PRODUCER, targetSysId));
		return res;
	},

	_deleteAttachments: function(attachmentIds) {
		var sysAtt = new GlideSysAttachment();
		for (var idx in attachmentIds)
			if (attachmentIds.hasOwnProperty(idx))
				sysAtt.deleteAttachment(attachmentIds[idx]);
	},

	_deleteRPAttachments: function(producerId) {
		var targetGR = new GlideRecord('sys_attachment');
		targetGR.addQuery('table_sys_id', producerId);
		targetGR.query();

		var attachmentIds = [];
		while (targetGR.next())
			attachmentIds.push(targetGR.getUniqueValue());
		this._deleteAttachments(attachmentIds);
	},

	getOriginalTemplate: function(recordProducerSysId) {
		var gr = new GlideRecord(this.TABLE_NAME_PRODUCER);
		var templateVal = '';
		if (!gr.get(recordProducerSysId))
			return templateVal;

		templateVal = gr.template.template;
		var fieldsAndVals = this._parseEncodedQuery(templateVal);
		this._addMandatoryFieldsToTemplateVals(fieldsAndVals);
		return this._formQuery(fieldsAndVals);
	},

	copyAttachments: function(srcGr, targetGr, removeExisting) {
		if (!srcGr.canRead()) {
			gs.warn("copyAttachments: User is not authorized to perform this action");
			return;
		}

		if (!targetGr.canWrite()){
			gs.warn("copyAttachments: User is not authorized to perform this action");
			return;
		}

		if (removeExisting) {
			attachmentIds = [];
			var attachmentGr = new GlideRecord('sys_attachment');
			attachmentGr.addQuery('table_name', this.TABLE_NAME_PROPOSAL);
			attachmentGr.addQuery('table_sys_id', targetGr.getUniqueValue());
			attachmentGr.query();

			while (attachmentGr.next()) 
				attachmentIds.push(j2js(attachmentGr.sys_id));

			this._deleteAttachments(attachmentIds);
		}

		// srcGr declared on line 210
		if (srcGr.hasAttachments())
			j2js(GlideSysAttachment.copy(srcGr.getTableName(), srcGr.getUniqueValue(), targetGr.getTableName(), targetGr.getUniqueValue()));

	},

	ajaxFunction_copyAttachments: function() {
		var srcTable = this.getParameter('sysparm_srcTable');
		var srcSysId = this.getParameter('sysparm_srcSysId');
		var targetTable = this.getParameter('sysparm_targetTable');
		var targetSysId = this.getParameter('sysparm_targetSysId');
		var removeExisting = (this.getParameter('sysparm_removeExisting') + '' === 'true');
		var attachmentIds = [];
		var attachmentNames = [];
		var attachmentImgSrcs = [];
		var attachmentActions = [];

		//Validations - can't find or read the source record, get out
		var srcGr = new GlideRecord(srcTable);
		if (!srcGr.get(srcSysId))
			return;

		if (!srcGr.canRead()) {
			gs.warn("ajaxFunction_copyAttachments: User is not authorized to perform this action");
			return;
		}

		//Alongside testing canRead on the source record, the user must have write access to the table or existing record
		//to add or remove attachments.
		//In the case that we don't have a record, we reinitialise and test the table level ACL.
		var targetGr = new GlideRecord(targetTable);
		if (!targetGr.get(targetSysId))
			targetGr = new GlideRecord(targetTable);

		if (!targetGr.canWrite()){
			gs.warn("ajaxFunction_copyAttachments: User is not authorized to perform this action");
			return;
		}

		if (removeExisting) {
			attachmentIds = [];
			var targetGR = new GlideRecord('sys_attachment');
			targetGR.addQuery('table_name', this.TABLE_NAME_PROPOSAL);
			targetGR.addQuery('table_sys_id', targetSysId);
			targetGR.query();

			while (targetGR.next()) {
				attachmentIds.push(j2js(targetGR.sys_id));
				attachmentNames.push(j2js(targetGR.file_name));
				attachmentImgSrcs.push(j2js(GlideSysAttachment.selectIcon(targetGR.sys_id)));
				attachmentActions.push('delete');
			}
			this._deleteAttachments(attachmentIds);
		}

		// srcGr declared on line 210
		if (srcGr.hasAttachments())
			j2js(GlideSysAttachment.copy(srcTable, srcSysId, targetTable, targetSysId));

		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_name', this.TABLE_NAME_PROPOSAL);
		gr.addQuery('table_sys_id', targetSysId);
		gr.query();

		while (gr.next()) {
			attachmentIds.push(j2js(gr.sys_id));
			attachmentNames.push(j2js(gr.file_name));
			attachmentImgSrcs.push(j2js(GlideSysAttachment.selectIcon(gr.sys_id)));
			attachmentActions.push('add');
		}
		this._generateAttachmentsResponse({
			ids: attachmentIds,
			names: attachmentNames,
			srcs: attachmentImgSrcs,
			actions: attachmentActions
		});
	},

	// Generate XML containing the Attachments info
	_generateAttachmentsResponse: function(attachmentsInfo) {
		for (var i in attachmentsInfo.ids) {
			if (attachmentsInfo.ids.hasOwnProperty(i)) {
				var attachment = this.newItem("attachmentInfo");
				attachment.setAttribute("id", attachmentsInfo.ids[i]);
				attachment.setAttribute("name", attachmentsInfo.names[i]);
				attachment.setAttribute("imgSrc", attachmentsInfo.srcs[i]);
				attachment.setAttribute("action", attachmentsInfo.actions[i]);
			}
		}
	},

	_createStandardChangeTemplate: function(stdChgProposalGR) {
		var gr = new GlideRecord(this.TABLE_NAME_TEMPLATE);
		gr.initialize();
		gr.name = stdChgProposalGR.template_name;
		gr.template = stdChgProposalGR.template_value;
		gr.short_description = stdChgProposalGR.short_description;
		return gr.insert();
	},

	_updateStandardChangeTemplate: function(stdChgProposalGR, templateId) {
		var templateGr = new GlideRecord(this.TABLE_NAME_TEMPLATE);
		if (templateGr.get(templateId)) {
			templateGr.name = stdChgProposalGR.template_name;
			templateGr.template = stdChgProposalGR.template_value;
			templateGr.short_description = stdChgProposalGR.short_description;
			templateGr.update();
		}
	},

	_updateRecordProducer: function(stdChgProposalGR, templateId, rpGr, versionId) {
		rpGr.name = stdChgProposalGR.template_name;
		rpGr.name.setDisplayValue(stdChgProposalGR.template_name.getDisplayValue());
		rpGr.short_description = stdChgProposalGR.short_description;
		rpGr.short_description.setDisplayValue(stdChgProposalGR.short_description.getDisplayValue());
		rpGr.category = stdChgProposalGR.category;
		rpGr.sc_catalogs = stdChgProposalGR.catalog;
		rpGr.template = templateId;
		rpGr.script = this._createScriptContent(versionId, rpGr.sys_id);
		rpGr.current_version = versionId;
		rpGr.update();

		//Update the version record with the new name
		var versionGr = new GlideRecord(this.TABLE_NAME_VERSION);
		if (versionGr.get(versionId)) {
			versionGr.setValue('name', this.getVersionName(versionGr));
			versionGr.update();
		}

		// Delete existing attachments if there
		this._deleteRPAttachments(rpGr.sys_id);

		this._copyAttachments(stdChgProposalGR, rpGr.sys_id);
	},

	_createVersion: function(producerId, proposalId) {
		var gr = new GlideRecord(this.TABLE_NAME_VERSION);
		gr.initialize();
		gr.std_change_producer = producerId;
		gr.std_change_proposal = proposalId;
		return gr.insert();
	},

	rollBackApproval: function(proposalGr) {
		proposalGr.approval = this.APPROVAL_STATE_NOT_REQUESTED;
		proposalGr.state = this.STATE_NEW;
		proposalGr.update();
	},

	_getCatalogParams: function(proposalGr, errParams) {
		if (gs.nil(proposalGr.catalog))
			errParams = proposalGr.catalog.getLabel();

		if (gs.nil(proposalGr.category))
			if (gs.nil(errParams))
				errParams = proposalGr.category.getLabel();
			else
				errParams = errParams + ", " + proposalGr.category.getLabel();
		return errParams;
	},

	validateCategorisation: function(proposalGr) {
		if (!this.isRetireTemplate(proposalGr) && (gs.nil(proposalGr.catalog) || gs.nil(proposalGr.category) || gs.nil(proposalGr.template_name))) {
			var errParams = '';
			errParams = this._getCatalogParams(proposalGr, errParams);

			if (gs.nil(proposalGr.template_name)) {
				if (gs.nil(errParams))
					errParams = proposalGr.template_name.getLabel();
				else
					errParams = errParams + ", " + proposalGr.template_name.getLabel();
			}
			gs.addErrorMessage(gs.getMessage('The following mandatory fields are not filled in: {0}', errParams));
			return "failure";
		} else
			return "success";
	},

	rejectProposal: function(proposalSysId) {
		var stdChgProposalGR = new GlideRecord(this.TABLE_NAME_PROPOSAL);
		if (stdChgProposalGR.get(proposalSysId)) {
			stdChgProposalGR.state = this.STATE_CANCELLED;
			stdChgProposalGR.active = false;
			stdChgProposalGR.update();
		}
	},

	// This method will be executed by the workflow when a proposal is rejected
	rejectProposalWF: function(proposalGr) {
		if (!proposalGr || !proposalGr.getUniqueValue()) {
			this.log.logWarning("rejectProposalWF: No std_change_proposal record supplied");
			return;
		}

		/* We disassociate existing approvals from the workflow so new approval records will be created when approval is requested again */
		var existingApprovalsGr = new GlideMultipleUpdate("sysapproval_approver");
		existingApprovalsGr.addQuery("sysapproval", proposalGr.getUniqueValue());
		existingApprovalsGr.addQuery("state", "!=", 'cancelled');
		existingApprovalsGr.addNotNullQuery("wf_activity");
		existingApprovalsGr.setValue("wf_activity", "");
		existingApprovalsGr.execute();
		existingApprovalsGr = new GlideMultipleUpdate("sysapproval_group");
		existingApprovalsGr.addQuery("parent", proposalGr.getUniqueValue());
		existingApprovalsGr.addQuery("approval", "!=", 'cancelled');
		existingApprovalsGr.addNotNullQuery("wf_activity");
		existingApprovalsGr.setValue("wf_activity", "");
		existingApprovalsGr.execute();
	},

	publishNewStandardChangeProposal: function(proposalSysId) {
		var stdChgProposalGR = new GlideRecord(this.TABLE_NAME_PROPOSAL);

		if (stdChgProposalGR.get(proposalSysId)) {
			var templateId = this._createStandardChangeTemplate(stdChgProposalGR);
			var versionId = this._createRecordProducerAndVersion(stdChgProposalGR, templateId);
			stdChgProposalGR.std_change_producer_version = versionId;
			stdChgProposalGR.active = false;
			stdChgProposalGR.state = this.STATE_CLOSED;
			stdChgProposalGR.update();
			return versionId;
		}
	},

	_deactivateTemplate: function(templateId) {
		if (templateId) {
			var templateGr = new GlideRecord(this.TABLE_NAME_TEMPLATE);
			if (templateGr.get(templateId)) {
				templateGr.active = false;
				templateGr.update();
			}
		}
	},

	retireExistingStandardChangeProposal: function(proposalSysId, existingProducerSysId) {
		var stdChgProposalGR = new GlideRecord(this.TABLE_NAME_PROPOSAL);
		if (stdChgProposalGR.get(proposalSysId)) {
			//deactivate related producer
			var producerGr = new GlideRecord(this.TABLE_NAME_PRODUCER);
			if (producerGr.get(existingProducerSysId)) {
				if (j2js(producerGr.retired)) {
					gs.addErrorMessage(gs.getMessage('Cannot retire Standard Template {0} again', producerGr.getDisplayValue()));
					return;
				}
				var versionId = this._createVersion(existingProducerSysId, proposalSysId);
				stdChgProposalGR.std_change_producer_version = versionId;
				stdChgProposalGR.active = false;
				stdChgProposalGR.state = this.STATE_CLOSED;
				stdChgProposalGR.update();

				producerGr.current_version = versionId;
				producerGr.retired = true;
				producerGr.update();
				this._deactivateTemplate(producerGr.template);
				return versionId;
			}
		}
	},

	modifyExistingStandardChangeProposal: function(proposalSysId, existingProducerSysId) {
		var stdChgProposalGR = new GlideRecord(this.TABLE_NAME_PROPOSAL);
		if (stdChgProposalGR.get(proposalSysId)) {
			//fetch producer
			var producerGr = new GlideRecord(this.TABLE_NAME_PRODUCER);
			if (producerGr.get(existingProducerSysId)) {
				if (j2js(producerGr.retired)) {
					gs.addErrorMessage(gs.getMessage('Cannot modify a retired Standard Template {0}', producerGr.getDisplayValue()));
					return;
				}
				var versionId = this._createVersion(existingProducerSysId, proposalSysId);
				var templateId = producerGr.template;
				if (templateId)
					this._updateStandardChangeTemplate(stdChgProposalGR, templateId);
				this._updateRecordProducer(stdChgProposalGR, templateId, producerGr, versionId);
				stdChgProposalGR.std_change_producer_version = versionId;
				stdChgProposalGR.active = false;
				stdChgProposalGR.state = this.STATE_CLOSED;
				stdChgProposalGR.update();
				return versionId;
			}
		}
	},

	cancelStandardChangeProposal: function(proposalId) {
		if (!proposalId)
			return;

		var stdChgProposalGR = new GlideRecord(this.TABLE_NAME_PROPOSAL);
		if (!stdChgProposalGR.get(proposalId) || !stdChgProposalGR.canWrite())
			return;

		stdChgProposalGR.state = this.STATE_CANCELLED;
		stdChgProposalGR.active = false;
		stdChgProposalGR.update();
	},

	copyChangeTaskTemplates: function(proposalGr) {
		if (!proposalGr || proposalGr.std_change_producer.nil())
			return;

		var versionGr = new GlideRecord(this.TABLE_NAME_VERSION);
		versionGr.addQuery('std_change_producer', proposalGr.getValue('std_change_producer'));
		versionGr.orderByDesc('version');
		versionGr.query();

		if (!versionGr.next())
			return;

		var currentProposalGr = new GlideRecord(this.TABLE_NAME_PROPOSAL);
		if (!currentProposalGr.get(versionGr.getValue('std_change_proposal')))
			return;

		var relatedTaskTemplateGr = new GlideRecord(this.TABLE_NAME_RELATED_TASK);
		relatedTaskTemplateGr.addQuery('std_change_proposal', currentProposalGr.getUniqueValue());
		relatedTaskTemplateGr.query();

		var newRelatedTaskTemplateGr = new GlideRecord(this.TABLE_NAME_RELATED_TASK);
		while (relatedTaskTemplateGr.next()) {
			newRelatedTaskTemplateGr.initialize();
			newRelatedTaskTemplateGr.setValue('std_change_proposal', proposalGr.getUniqueValue());
			newRelatedTaskTemplateGr.setValue('name', relatedTaskTemplateGr.name);
			newRelatedTaskTemplateGr.setValue('short_description', relatedTaskTemplateGr.short_description);
			newRelatedTaskTemplateGr.setValue('template', relatedTaskTemplateGr.template);
			newRelatedTaskTemplateGr.setValue('order', relatedTaskTemplateGr.order);
			newRelatedTaskTemplateGr.insert();
		}
	},

	createChangeTasks: function(changeGr) {
		if (!changeGr || changeGr.std_change_producer_version.nil())
			return;

		var versionGr = new GlideRecord(this.TABLE_NAME_VERSION);
		if (!versionGr.get(changeGr.getValue('std_change_producer_version')))
			return;

		var proposalGr = new GlideRecord(this.TABLE_NAME_PROPOSAL);
		if (!proposalGr.get(versionGr.getValue('std_change_proposal')))
			return;

		var relatedTaskTemplateGr = new GlideRecord(this.TABLE_NAME_RELATED_TASK);
		relatedTaskTemplateGr.addQuery('std_change_proposal', proposalGr.getUniqueValue());
		relatedTaskTemplateGr.orderBy('order');
		relatedTaskTemplateGr.query();

		var changeTaskGr = new GlideRecord(this.TABLE_NAME_CHANGE_TASK);
		while (relatedTaskTemplateGr.next()) {
			changeTaskGr.initialize();
			changeTaskGr.setValue(this.TABLE_NAME_CHANGE, changeGr.getUniqueValue());
			changeTaskGr.applyEncodedQuery(relatedTaskTemplateGr.getValue('template'));
			changeTaskGr.insert();
		}

	},

	_getPropertyValue: function(propertyName) {
		if (!this._propGr) {
			var gr = new GlideRecord(this.TABLE_NAME_PROPERTIES);
			// Using number instead of sysid since if ever this row
			// gets deleted then a row with same number can be
			// recreated. But row with same sysid is impossible to create.
			gr.addQuery(this.ATTR_INTERNAL_NAME, this.PROP_ROW_KEY);
			gr.query();
			if (!gr.next()) {
				this.log.logErr('Property row not found!');
				return;
			}
			this._propGr = gr;
		}
		var returnVal = this._propGr.getValue(propertyName);
		if (returnVal === null)
			returnVal = '';
		return j2js(returnVal);
	},

	_getBooleanPropertyValue: function(propertyName, defaultValue) {
		var val = this._getPropertyValue(propertyName) + '';
		if (val)
			return val === '1';
		return defaultValue;
	},

	_getCsvPropertyValue: function(propertyName) {
		var val = this._getPropertyValue(propertyName);
		if (val) // No need for elaborate parsing as in ChangeUtils since this is system saved.
			return val.split(',');
		else
			return [];
	},

	getValue: function(property) {
		return this._getPropertyValue(property);
	},

	// prepare a name , value array from encodedQuery.
	// It creates two arrays of name and value each.
	_parseEncodedQuery: function(query, noEscape) {
		return this._parseEncodedQueryByTable(this.TABLE_NAME_CHANGE, query, noEscape);
	},

	_parseEncodedQueryByTable: function(tableName, query, noEscape) {
		var fieldsAndVals = {
			names: [],
			vals: []
		};
		if (!query)
			return fieldsAndVals;

		if (!GlideTableDescriptor.isValid(tableName))
			return fieldsAndVals;

		var qs = new GlideQueryString(tableName, query);
		qs.deserialize();

		var terms = qs.getTerms();

		for (var i = 0; i < terms.size(); i++) {
			var term = terms.get(i);
			var fieldName = term.getField();
			if (!fieldName)
				continue;

			var fieldValue = "" + term.getValue();
			if (!noEscape)
				fieldValue = fieldValue.replaceAll("^", "^^");

			fieldsAndVals.names.push("" + fieldName);
			fieldsAndVals.vals.push(fieldValue);
		}

		return fieldsAndVals;
	},

	_formQuery: function(q) {
		// We are not encoding q.vals[i], so if the value
		// has ^ then the formed query will not be properly
		// parsable. However, in our system too I see no
		// code which parses the ^. So, I don't know how to
		// escape that.
		var val = '';
		for (var i = 0; i < q.names.length; i++) {
			if (i > 0)
				val = val + '^';
			val = val + q.names[i] + '=' + q.vals[i];
		}
		if (val)
			val = val + '^EQ';
		return val;
	},

	// This is a simple converter.
	// resp should be single level deep object.
	// Each of its attributes are converted into tags under root element.
	// Data in the object referred by that key is set as attributes in
	// in the generated tag. If the key refers to an array instead, then
	// the key is repeated for each item in the array and the above logic
	// applies. If the key refered to a string instead then that value is
	// set into the tag with value as attribute name.
	_toXmlAndSet: function(resp) {
		for (var k in resp)
			if (resp.hasOwnProperty(k))
				this._addToAttr(resp[k], k);
	},

	_addToAttr: function(o, k) {
		if (o instanceof Array)
			for (var i = 0; i < o.length; i++) {
				o[i].idx = i;
				this._addAttr(k, o[i]);
			}
		else {
			if (typeof o === 'string')
				o = { value: o };
			this._addAttr(k, o);
		}
	},

	_addAttr: function(tagName, o) {
		var item = this.newItem(tagName);
		for (var attr in o)
			if (o.hasOwnProperty(attr))
				item.setAttribute(attr, o[attr] + '');
	},

	_attrToLabel: function(attr) {
		var chgAttrMeta = sys_meta[this.TABLE_NAME_CHANGE][attr];
		var valid = chgAttrMeta ? true : false;
		var active = valid ? (chgAttrMeta.active === "true") : false;
		var label = chgAttrMeta.label;
		return {
			name: attr,
			label: label,
			valid: valid,
			active: active
		};
	},

	_attrsToLabel: function(attrs) {
		var ans = [];
		for (var i = 0; i < attrs.length; i++) {
			var attr = attrs[i];
			ans.push(this._attrToLabel(attr));
		}
		return ans;
	},

	ajaxFunction_getFieldConfigs: function() {
		this._toXmlAndSet(this._getFieldConfigs());
		return 'ok';
	},

	getFieldConfigsJson: function(chgReqId) {
		return new JSON().encode(this._getFieldConfigs(chgReqId));
	},

	_getFieldConfigs: function(chgReqId) {
		var resp = {};
		this._addDefaultValuesConfig(resp, true, chgReqId);
		this._addMandatoryFieldsConfig(resp);
		this._addUnmodifiableFieldsConfig(resp);
		return resp;
	},

	_isRecordChanged: function(unionSampleChgId, q, isChanged) {
		var copyAttrs = this._getCsvPropertyValue(this.PROP_FIELDS_TO_COPY);
		var chgReqGR = new GlideRecord(this.TABLE_NAME_CHANGE);

		if (!chgReqGR.get(unionSampleChgId))
			return isChanged;
		for (var i = 0; i < copyAttrs.length; i++) {
			var field = copyAttrs[i];
			if (chgReqGR.isValidField(field)) {
				var value = chgReqGR.getValue(field);
				if (value === null)
					value = '';
				value = value + ''; // Making it string.
				var idx = this.arrayUtil.indexOf(q.names, field);
				if (idx === -1) {
					q.names.push(field);
					q.vals.push(value);
				} else
					q.vals[idx] = value;
				isChanged = true;
			} else
				this.log.logWarning("_addDefaultValuesConfig: Invalid field '" + field + "' provided for table 'change_request'.");
		}
		return isChanged;
	},

	_addDefaultValuesConfig: function(resp, unionMandatoryFields, unionSampleChgId) {
		var val = this._getPropertyValue(this.PROP_DEFAULT_VALUES);
		if (unionMandatoryFields || unionSampleChgId) {
			var q = this._parseEncodedQuery(val);
			var isChanged = false;

			if (unionMandatoryFields)
				isChanged = this._addMandatoryFieldsToTemplateVals(q);

			if (unionSampleChgId)
				isChanged = this._isRecordChanged(unionSampleChgId, q, isChanged);

			if (isChanged)
				val = this._formQuery(q);
		}
		resp.default_values = val;
	},

	addMandatoryFieldsToTemplate: function(template) {
		var fieldsAndVals = this._parseEncodedQuery(template);

		this._addMandatoryFieldsToTemplateVals(fieldsAndVals);

		return this._formQuery(fieldsAndVals);
	},

	_addMandatoryFieldsToTemplateVals: function(fieldsAndVals) {
		var isChanged = false;

		if (!fieldsAndVals)
			fieldsAndVals = {
				names: [],
				vals: []
			};

		var mandatory = this._getCsvPropertyValue(this.PROP_MANDATORY_FIELDS);
		for (var i = 0; i < mandatory.length; i++)
			if (!this.arrayUtil.contains(fieldsAndVals.names, mandatory[i])) {
				fieldsAndVals.names.push(mandatory[i]);
				fieldsAndVals.vals.push('');
				isChanged = true;
			}
		return isChanged;
	},

	_addMandatoryFieldsConfig: function(resp) {
		var val = this._attrsToLabel(this._getCsvPropertyValue(this.PROP_MANDATORY_FIELDS));
		resp.mandatory = val;
	},

	_addUnmodifiableFieldsConfig: function(resp) {
		var val = this._attrsToLabel(this._getCsvPropertyValue(this.PROP_UNMODIFIABLE_FIELDS));
		resp.unmodifiable = val;
	},

	_checkRestrictedFields: function(q, recordLabel, displayErrors) {
		var result = {
			validationPassed: "true",
			errorMsgs: []
		};
		var attemptedSet = '';
		var unmodifiable = this._getCsvPropertyValue(this.PROP_UNMODIFIABLE_FIELDS);
		if (q && unmodifiable) {
			for (var i = 0; i < q.names.length; i++) {
				var f = q.names[i];
				var idx = this.arrayUtil.indexOf(unmodifiable, f);
				if (idx !== -1)
					attemptedSet = attemptedSet + this._attrToLabel(unmodifiable[idx]).label + ', ';
			}
		}
		if (attemptedSet) {
			result.validationPassed = false;
			var errorMsg = gs.getMessage('The following "{0} values" are not allowed to be set in a template: {1}',
				[recordLabel, attemptedSet.substring(0, attemptedSet.length - 2)]);
			result.errorMsgs.push(errorMsg);
			if (displayErrors)
				gs.addErrorMessage(errorMsg);
			return result;
		} else {
			return result;
		}
	},

	_getUnfilledValues: function(q, m, unfilledValues) {
		var label = this._attrToLabel(m).label;
		if (q) {
			var idx = this.arrayUtil.indexOf(q.names, m);
			if (idx === -1 || q.vals[idx] === '')
				unfilledValues = unfilledValues + label + ', ';
		} else
			unfilledValues = unfilledValues + label + ', ';
		return unfilledValues;
	},

	_checkMandatoryFields: function(q, recordLabel, displayErrors) {
		var result = {
			validationPassed: "true",
			errorMsgs: []
		};
		var unfilledValues = '';
		var mandatory = this._getCsvPropertyValue(this.PROP_MANDATORY_FIELDS);
		if (mandatory)
			for (var i = 0; i < mandatory.length; i++)
				unfilledValues = this._getUnfilledValues(q, mandatory[i], unfilledValues);
		if (unfilledValues) {
			result.validationPassed = false;
			var errorMsg = gs.getMessage('"{0} values" have not been provided: {1}', [recordLabel, unfilledValues.substring(0, unfilledValues.length - 2)]);
			result.errorMsgs.push(errorMsg);
			if (displayErrors)
				gs.addErrorMessage(errorMsg);
			return result;
		} else
			return result;
	},

	getTemplateValidationResult: function(proposalGr, displayErrors) {
		var result = {
			validationPassed: false,
			errorMsgs: []
		};

		if (!proposalGr || !proposalGr.getUniqueValue()) {
			this.log.logError("validateTemplateValueCompliance: no Standard Change Proposal record supplied");
			return result;
		}

		return this.getTemplateValueValidationResult(proposalGr.getValue('template_value'));
	},

	getTemplateValueValidationResult: function(templateValue, displayErrors) {
		var result = {
			validationPassed: false,
			errorMsgs: []
		};

		if (!templateValue)
			templateValue = "";

		var q = this._parseEncodedQuery(templateValue);
		var mandatoryResult = this._checkMandatoryFields(q, this.TABLE_LABEL_CHANGE, displayErrors);
		var restrictedResult = this._checkRestrictedFields(q, this.TABLE_LABEL_CHANGE, displayErrors);

		result.validationPassed = mandatoryResult.validationPassed && restrictedResult.validationPassed;
		result.errorMsgs = mandatoryResult.errorMsgs.concat(restrictedResult.errorMsgs);
		return result;
	},

	ajaxFunction_validateTemplateValue: function() {
		var templateValue = this.getParameter("sysparm_template_value");

		return JSON.stringify(this.getTemplateValueValidationResult(templateValue));
	},

	validateProposal: function(proposalGr, displayErrors, checkTasks) {
		var result = false;
		if (!proposalGr || !proposalGr.getUniqueValue()) {
			this.log.logError("validateProposal: no Standard Change Proposal record supplied");
			return result;
		}

		var categoryResult = this.validateCategorisation(proposalGr);
		result = categoryResult === 'success';

		// If this is a retire type proposal there is no other validation to do
		if (this.isRetireTemplate(proposalGr))
			return result;

		var templateResult = this.validateTemplateValueCompliance(proposalGr, displayErrors);
		result = result && templateResult;
		if (!checkTasks)
			return result;

		var taskUtils = new StdChangeTaskUtils();
		var chgTaskTemplateGr = new GlideRecord(this.TABLE_NAME_RELATED_TASK);
		chgTaskTemplateGr.addQuery("std_change_proposal", proposalGr.getUniqueValue());
		chgTaskTemplateGr.query();
		while (chgTaskTemplateGr.next()) {
			var taskResult = taskUtils.getTemplateValidationResult(chgTaskTemplateGr, false);
			if (!taskResult.validationPassed) {
				result = false;
				this._handleErrorMsgs(chgTaskTemplateGr, taskResult, displayErrors);
			}
		}
		return result;
	},

	_handleErrorMsgs: function(chgTaskTemplateGr, taskResult, displayErrors) {
		var link = '<a target="_blank" href="' + chgTaskTemplateGr.getLink(true) + '"><b>' + chgTaskTemplateGr.getDisplayValue() + '</b></a>';
		var errorMsg = gs.getMessage("Validation failed for Change Task template {0}:<br/>", link);
		for (var i = 0; i < taskResult.errorMsgs.length; i++)
			errorMsg += '<span style="margin-left: 10px;">' + taskResult.errorMsgs[i] + '</span><br/>';

		if (displayErrors)
			gs.addErrorMessage(errorMsg);
	},

	validateTemplateValueCompliance: function(proposalGr, displayErrors) {
		if (!proposalGr || !proposalGr.getUniqueValue()) {
			this.log.logError("validateTemplateValueCompliance: no Standard Change Proposal record supplied");
			return false;
		}

		// if no "displayErrors" argument is passed assume true
		if (typeof displayErrors === "undefined")
			displayErrors = true;

		var q = this._parseEncodedQuery(proposalGr.getValue('template_value'));
		var mandatoryResult = this._checkMandatoryFields(q, this.TABLE_LABEL_CHANGE, displayErrors);
		var restrictedResult = this._checkRestrictedFields(q, this.TABLE_LABEL_CHANGE, displayErrors);

		return mandatoryResult.validationPassed && restrictedResult.validationPassed;
	},

	_isInvalidState: function(state) {
		if (state === this.STATE_CLOSED || state === this.STATE_CANCELLED || (state === this.STATE_WIP && !gs.hasRole(this.ROLE_CHG_MANAGER)))
			return true;
		return false;
	},

	reviewedFieldsAcl: function(proposalGr) {
		if (!proposalGr || !proposalGr.getUniqueValue())
			return false;

		// If this is a retire type proposal there is no other validation to do
		if (this.isRetireTemplate(proposalGr))
			return false;

		var state = proposalGr.getValue(this.ATTR_STATE) - 0;
		if (this._isInvalidState(state))
			return false;
		return true;
	},

	ajaxFunction_getFieldNamesFromTemplateValue: function() {
		var sydId = this.getParameter('sysparm_sysId');
		var tableName = this.getParameter('sysparm_tableName');
		var gr = new GlideRecordSecure(tableName);
		gr.addQuery('sys_id', sydId);
		gr.query();

		var q = {};
		if (gr.next())
			q = this._parseEncodedQuery(gr.std_change_producer_version.std_change_proposal.template_value);
		return q.names.toString();
	},

	getFieldNamesFromTemplate: function(encodedQuery) {
		var q = this._parseEncodedQuery(encodedQuery);
		return q.names;
	},

	getVersionNumber: function(stdVersionGr) {
		var countGa = new GlideAggregate(this.TABLE_NAME_VERSION);
		countGa.addAggregate('COUNT');
		countGa.addQuery(this.ATTR_STD_CHG_PRODUCER,
			stdVersionGr.getValue(this.ATTR_STD_CHG_PRODUCER));
		countGa.query();
		var count = 0;
		if (countGa.next())
			count = countGa.getAggregate('COUNT');
		return (count * 1) + 1;
	},

	getVersionName: function(stdVersionGr) {
		return stdVersionGr.std_change_producer.getDisplayValue() + ' - ' + stdVersionGr.version;
	},

	_getTemplateValue: function(tableName, gr /*Pass gr after querying*/) {
		var value = '';
		if (gr) {
			if (tableName.equals(this.TABLE_NAME_PRODUCER))
				value = gr.template.template;
			else if (tableName.equals(this.TABLE_NAME_TEMPLATE))
				value = gr.template;
			else if (tableName.equals(this.TABLE_NAME_VERSION))
				value = gr.std_change_proposal.template_value;

			if (value !== '') {
				if (this.log.debugOn())
					this.log.logDebug('template' + value);
				return j2js(value);
			}
		}
		return;
	},

	_isValidCatalog: function(catalogSysId) {
		var catalogGr = new GlideRecord(this.TABLE_NAME_CATALOG);
		if (!catalogGr.get(catalogSysId)) {
			gs.addErrorMessage(gs.getMessage('Parent "Catalog" specified in "Standard Change Properties" does not exist. Please ask admin to correct the setup.'));
			return false;
		}
		return true;
	},

	_isValidCategory: function(catalogSysId, categorySysId) {
		var categoryGr = new GlideRecord(this.TABLE_NAME_CATEGORY);
		if (categoryGr.get(categorySysId)) {
			if (!categoryGr.sc_catalog) {
				gs.addErrorMessage(gs.getMessage('Parent "Category" specified in "Standard Change Properties" does not belong to any Catalog. Please ask admin to correct the setup.'));
				return false;
			} else if (catalogSysId !== j2js(categoryGr.sc_catalog)) {
				gs.addErrorMessage(gs.getMessage('Parent "Category" specified is no longer attached to the specified "Catalog" in "Standard Change Properties". Please ask admin to correct the setup.'));
				return false;
			}
		} else {
			gs.addErrorMessage(gs.getMessage('Parent "Category" specified in "Standard Change Properties" does not exist. Please ask admin to correct the setup.'));
			return false;
		}
		return true;
	},

	isStandardChangeSetupValid: function() {
		var catalogSysId = this._getPropertyValue(this.ATTR_CATALOG);
		var categorySysId = this._getPropertyValue(this.ATTR_CATEGORY);

		if (JSUtil.notNil(catalogSysId) && JSUtil.notNil(categorySysId)) {
			if (!this._isValidCatalog(catalogSysId))
				return false;

			if (!this._isValidCategory(catalogSysId, categorySysId))
				return false;
		} else {
			gs.addErrorMessage(gs.getMessage('Parent "Catalog" or "Category" is not specified in "Standard Change Properties". Please ask admin to correct the setup.'));
			return false;
		}
		return true;
	},

	isChangeStandardAndTwoStepEnabled: function(changeRequestGr) {
		if (changeRequestGr && changeRequestGr.type + '' === 'standard' && changeRequestGr.getValue(this.ATTR_STD_CHG_PRODUCER_VERSION) && this._getBooleanPropertyValue(this.PROP_TWO_STEP, false))
			return true;
		return false;
	},

	ajaxFunction_getTemplNCategoryForModify: function() {
		var tableNameProducer = this.getParameter('sysparm_tableName');
		var producerGr = new GlideRecord(tableNameProducer);
		var producerSysId = this.getParameter('sysparm_sysid');
		var addMandatoryFields = this.getParameter('add_mandatory_fields') + '';
		var ans = {};
		if (producerGr.get(producerSysId)) {
			ans.template = this._getTemplateValue(tableNameProducer, producerGr);
			if (addMandatoryFields === "true") {
				var fieldsAndVals = this._parseEncodedQuery(ans.template);
				this._addMandatoryFieldsToTemplateVals(fieldsAndVals);
				ans.template = this._formQuery(fieldsAndVals);
			}
			ans.catalog = j2js(producerGr.sc_catalogs);
			ans.category = j2js(producerGr.category);
			ans.templateName = j2js(producerGr.name);
			ans.hasAttachments = producerGr.hasAttachments() + '';
			this._toXmlAndSet(ans);
		}
	},

	ajaxFunction_getTemplateValue: function() {
		var tableName = this.getParameter('sysparm_tableName');
		var gr = new GlideRecordSecure(tableName);
		var sysId = this.getParameter('sysparm_sysid');
		if (gr.get(sysId))
			return this._getTemplateValue(tableName, gr);
		return;
	},

	_addQueryAllClosedChanges: function(changeGa /*GlideAggregate*/) {
		changeGa.addNotNullQuery(this.ATTR_CLOSE_CODE);
		changeGa.addQuery('active', false);
	},

	_addQueryAllUnsuccessfulChanges: function(changeGa /*GlideAggregate*/) {
		changeGa.addQuery(this.ATTR_CLOSE_CODE, this.CLOSE_CODES_UNSUCCESSFUL);
		changeGa.addQuery('active', false);
	},

	calculateVersionAndTemplateStats: function(versionId) {
		var startTime = new GlideDateTime();

		// if we've been passed a Version Id check it's valid and get associated producer Id
		var producerId;
		if (versionId) {
			var stdChgProducerVersionGr = new GlideRecord(this.TABLE_NAME_VERSION);
			if (stdChgProducerVersionGr.get(versionId))
				producerId = stdChgProducerVersionGr.getValue(this.ATTR_STD_CHG_PRODUCER);
			else {
				this.log.logWarning('calculateVersionAndTemplateStats: no matching ' + stdChgProducerVersionGr.sys_meta.label + ' record found for sys_id "' + versionId + '"');
				return;
			}
		}

		// The addition of the SYS_ID at the end is important. GlideAgg will automatically add the dot walked fields display value to the group by.
		// We don't really want this as it doesn't play nicely with sorting. We never want the names included in sorting, only the sys_id to prevent issues with Producers with
		// the same name.
		var dotWalkedProducerVersionProducerSysId = this.ATTR_STD_CHG_PRODUCER_VERSION + '.' + this.ATTR_STD_CHG_PRODUCER + '.' + this.ATTR_SYS_ID;
		var dotWalkedProducerVersionSysId = this.ATTR_STD_CHG_PRODUCER_VERSION + '.' + this.ATTR_SYS_ID;

		var chgGr = new GlideAggregate(this.TABLE_NAME_CHANGE);
		chgGr.addInactiveQuery();
		chgGr.addNotNullQuery(this.ATTR_CLOSE_CODE);
		chgGr.addNotNullQuery(this.ATTR_STD_CHG_PRODUCER_VERSION);
		if (producerId)
			chgGr.addQuery(this.ATTR_STD_CHG_PRODUCER_VERSION + '.' + this.ATTR_STD_CHG_PRODUCER, "=", producerId);
		chgGr.groupBy(dotWalkedProducerVersionProducerSysId);
		chgGr.groupBy(dotWalkedProducerVersionSysId);
		chgGr.groupBy(this.ATTR_CLOSE_CODE);
		chgGr.addAggregate("COUNT");
		chgGr.orderBy(dotWalkedProducerVersionProducerSysId);
		chgGr.orderBy(dotWalkedProducerVersionSysId);
		chgGr.query();

		var queryEndTime = new GlideDateTime();

		var closeCode;
		var currentProducerVersionId;
		var currentProducerId;
		var versionUnsuccessfulCount = 0;
		var versionTotalCount = 0;
		var producerUnsuccessfulCount = 0;
		var producerTotalCount = 0;
		var usedProducerVersionIds = [];
		var usedProducerIds = [];
		var processedRecords = 0;
		var allRecordsProcessed = !chgGr.hasNext();
		var lastRecord = false;

		while (chgGr.next() || allRecordsProcessed === false) {
			var count = parseInt(chgGr.getAggregate('COUNT'), 10);

			if (isNaN(count)) {
				lastRecord = !chgGr.hasNext();
				continue;
			}

			if (lastRecord)
				allRecordsProcessed = true;

			// We've got Change Request data for a new template so save the current collected values into the previous template
			if (currentProducerId && (currentProducerId !== chgGr.getValue(dotWalkedProducerVersionProducerSysId) || lastRecord)) {
				this._updateTemplateStats(currentProducerVersionId, currentProducerId, { total: producerTotalCount, totalUnsuccessful: producerUnsuccessfulCount });
				usedProducerIds.push(currentProducerId);
				producerUnsuccessfulCount = 0;
				producerTotalCount = 0;
			}

			// We've got Change Request data for a new template version so save the current collected values into the previous template version
			if (currentProducerVersionId && (currentProducerVersionId !== chgGr.getValue(dotWalkedProducerVersionSysId) || lastRecord)) {
				this._updateVersionStats(currentProducerVersionId, { total: versionTotalCount, totalUnsuccessful: versionUnsuccessfulCount });
				usedProducerVersionIds.push(currentProducerVersionId);
				versionUnsuccessfulCount = 0;
				versionTotalCount = 0;
			}

			currentProducerId = chgGr.getValue(dotWalkedProducerVersionProducerSysId);
			currentProducerVersionId = chgGr.getValue(dotWalkedProducerVersionSysId);
			closeCode = chgGr.getValue(this.ATTR_CLOSE_CODE);

			versionTotalCount += count;
			producerTotalCount += count;
			if (this._isCloseCodeUnsuccessful(closeCode)) {
				versionUnsuccessfulCount += count;
				producerUnsuccessfulCount += count;
			}

			processedRecords++;
			lastRecord = !chgGr.hasNext();
		}

		/* Any template versions that we didn't update above means those versions haven't been used on any
		   Change Request so update with 0 values */
		stdChgProducerVersionGr = new GlideRecord(this.TABLE_NAME_VERSION);
		if (producerId)
			stdChgProducerVersionGr.addQuery(this.ATTR_STD_CHG_PRODUCER, "=", producerId);
		stdChgProducerVersionGr.addQuery('sys_id', 'NOT IN', usedProducerVersionIds);
		stdChgProducerVersionGr.query();
		while (stdChgProducerVersionGr.next())
			this._updateVersionStats(stdChgProducerVersionGr.getUniqueValue(), { total: 0, totalUnsuccessful: 0 });

		/* And finally, update any Templates with 0 values where the sum of closed Change Requests across all
		   template versions is 0 */
		var dotWalkedProducerSysId = this.ATTR_STD_CHG_PRODUCER + '.' + this.ATTR_SYS_ID;

		stdChgProducerVersionGr = new GlideAggregate(this.TABLE_NAME_VERSION);
		if (producerId)
			stdChgProducerVersionGr.addQuery(this.ATTR_STD_CHG_PRODUCER, producerId);
		stdChgProducerVersionGr.addAggregate('SUM', 'closed_change_count');
		stdChgProducerVersionGr.addHaving('SUM', 'closed_change_count', '=', 0);
		stdChgProducerVersionGr.groupBy(dotWalkedProducerSysId);
		stdChgProducerVersionGr.query();

		while (stdChgProducerVersionGr.next())
			this._updateTemplateStats(stdChgProducerVersionGr.getUniqueValue(), stdChgProducerVersionGr.getValue(dotWalkedProducerSysId), { total: 0, totalUnsuccessful: 0 });

		this.log.logInfo("calculateVersionAndTemplateStats: completed\n" +
			(producerId ? 'Standard Change Template id: ' + producerId : '') +
			'Records processed: ' + processedRecords +
			'\nQuery time: ' + new GlideDuration(queryEndTime.getNumericValue() - startTime.getNumericValue()).getDurationValue() +
			'\nTotal time: ' + new GlideDuration(new GlideDateTime().getNumericValue() - startTime.getNumericValue()).getDurationValue());
	},

	updateVersionStats: function(versionId /*sys_id string*/) {
		this._updateVersionStats(versionId);
		this._updateTemplateStats(versionId);
	},

	_getStatsResult: function(queryColumn, sysId) {
		var total = 0;
		var totalUnsuccessful = 0;

		var ga = new GlideAggregate(this.TABLE_NAME_CHANGE);
		ga.addAggregate('COUNT');
		ga.addQuery(queryColumn, sysId);
		this._addQueryAllClosedChanges(ga);
		ga.query();
		if (ga.next())
			total = ga.getAggregate('COUNT') * 1;

		ga = new GlideAggregate(this.TABLE_NAME_CHANGE);
		ga.addAggregate('COUNT');
		ga.addQuery(queryColumn, sysId);
		this._addQueryAllUnsuccessfulChanges(ga);
		ga.query();
		if (ga.next())
			totalUnsuccessful = ga.getAggregate('COUNT') * 1;

		var percentSuccess = (total === 0) ? 0 : ((total - totalUnsuccessful) * 100.0) / total;

		var statsResult = {};
		statsResult.total = total;
		statsResult.totalUnsuccessful = totalUnsuccessful;
		statsResult.percentSuccess = percentSuccess;
		return statsResult;
	},

	_updateVersionStats: function(versionId /*sys_id string*/, stats) {
		var gr = new GlideRecord(this.TABLE_NAME_VERSION);
		if (!gr.get(versionId))
			return;

		if (!stats || isNaN(stats.total) || isNaN(stats.totalUnsuccessful))
			stats = this._getStatsResult(this.ATTR_STD_CHG_PRODUCER_VERSION, versionId);

		gr.closed_change_count = stats.total;
		gr.unsuccessful_change_count = stats.totalUnsuccessful;

		if (!stats.hasOwnProperty('percentSuccess'))
			gr.percent_successful = stats.total === 0 ? 0 : (((stats.total - stats.totalUnsuccessful) / stats.total) * 100).toFixed(2);
		else
			gr.percent_successful = parseInt(stats.percentSuccess);

		return gr.update();
	},

	_updateTemplateStats: function(versionId /*sys_id string*/, templateId, stats) {
		if (!templateId) {
			var gr = new GlideRecord(this.TABLE_NAME_VERSION);
			if (!gr.get(versionId))
				return;
			else
				templateId = gr.std_change_producer;
		}

		var templateGr = new GlideRecord(this.TABLE_NAME_PRODUCER);
		if (!templateGr.get(templateId))
			return;

		if (!stats || isNaN(stats.total) || isNaN(stats.totalUnsuccessful))
			stats = this._getStatsResult(this.ATTR_STD_CHG_PRODUCER_VERSION + "." + this.ATTR_STD_CHG_PRODUCER, templateId);

		templateGr.closed_change_count = stats.total;
		templateGr.unsuccessful_change_count = stats.totalUnsuccessful;

		if (!stats.hasOwnProperty('percent_success'))
			templateGr.percent_successful = stats.total === 0 ? 0 : (((stats.total - stats.totalUnsuccessful) / stats.total) * 100).toFixed(2);
		else
			templateGr.percent_successful = parseInt(stats.percentSuccess);

		return templateGr.update();
	},

	getReadOnlyFields: function() {
		return this._getCsvPropertyValue(this.PROP_READONLY_FIELDS);
	},

	ajaxFunction_getReadOnlyFields: function() {
		var tableName = this.getParameter('sysparm_tableName') + '';
		var gr = new GlideRecord(tableName);
		var sysId = this.getParameter('sysparm_sysId');

		if (tableName === this.TABLE_NAME_CHANGE && gr.get(sysId) && gr.canRead() && gr.getValue(this.ATTR_STD_CHG_PRODUCER_VERSION))
			return this.getReadOnlyFields().toString();

		return '';
	},

	ajaxFunction_getReadOnlyFieldsOnInsert: function() {
		return this.getReadOnlyFields().toString();
	},

	ajaxFunction_getCategory: function() {
		return this._getPropertyValue(this.ATTR_CATEGORY);
	},

	/*****************************************************************************************************************
	 * Utility function to get list of categories under a particular category.
	 * Usage for a reference qualifier below :
	 * javascript:'active=true^sc_catalog=e0d08b13c3330100c8b837659bba8fb4^'+
	 * +new StdChangeUtils().getCategoriesInHierarchy('b0fdfb01932002009ca87a75e57ffbe9',3)
	 *******************************************************************************************************************/

	getCategoriesInHierarchy: function(startWithCategoryId, depth) {
		return GlideappCategory.get(startWithCategoryId).getHierarchicalCategoryQueryString(depth);
	},

	/*************************************************************************************************************
	 * Utility function to merge two encoded queries, and return back the sorted unique labels and display values.
	 *************************************************************************************************************/
	getMergedLabelValueFromEncodedQueries: function(query1, query2) {

		// Parse the encoded query, get the name and value pair
		var query1NameValues = this._parseEncodedQuery(query1);
		var query2NameValues = this._parseEncodedQuery(query2);

		// Convert the names to labels, this will return us the name and label pair
		var query1NameLabels = this._attrsToLabel(query1NameValues.names);
		var query2NameLabels = this._attrsToLabel(query2NameValues.names);

		// Merge and sort the two name label arrays of objects into a single array.
		// The comparison for merging (in order to get unique values) and sorting is based on the field name
		var mergedNameLabels = this._mergeQueryNameLabels(query1NameLabels, query2NameLabels);

		// Below dummy glide records are needed to get display values, else we will not be able to get display values for reference fields.
		var mergedLabelDisplayValues = [];
		var sampleChangeGr = new GlideRecord(this.TABLE_NAME_CHANGE);
		sampleChangeGr.initialize();

		// Loop through the merged name labels, and assign display values and valid/active flags.
		var ml;
		for (var k = 0; k < mergedNameLabels.length; k++) {
			ml = mergedNameLabels[k];
			if (!ml.valid || ml.valid && sampleChangeGr[ml.name].canRead()) {
				var displayValue1 = this._getDisplayValueFromGlideRecord(ml.name, query1NameLabels, query1NameValues, sampleChangeGr);
				var displayValue2 = this._getDisplayValueFromGlideRecord(ml.name, query2NameLabels, query2NameValues, sampleChangeGr);
				mergedLabelDisplayValues.push({
					label: ml.label,
					name: ml.name,
					displayValue1: displayValue1,
					displayValue2: displayValue2,
					valid: ml.valid,
					active: ml.active
				});
			}
		}

		// The returned value is an array of objects which structure is as in the below example:
		// {label : "Description", name : "description", displayValue1 : "desc 1", displayValue1 : "", active : true, valid : true};
		return mergedLabelDisplayValues;
	},

	_mergeQueryNameLabels: function(query1NameLabels, query2NameLabels) {
		var tempMergedQueryNameLabels = query1NameLabels.concat(query2NameLabels);
		var l = tempMergedQueryNameLabels.length;
		var mergedQueryNameLabels = [];
		for (var i = 0; i < l; i++) {
			for (var j = i + 1; j < l; j++)
				if (tempMergedQueryNameLabels[i].name === tempMergedQueryNameLabels[j].name)
					j = ++i;
			mergedQueryNameLabels.push(tempMergedQueryNameLabels[i]);
		}
		return mergedQueryNameLabels.sort(this._queryNameLabelsComparator);
	},

	_queryNameLabelsComparator: function(a, b) {
		return (a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0);
	},

	_getDisplayValueFromGlideRecord: function(name, queryNameLabels, queryNameValues, sampleChangeGr) {
		var displayValue = "";
		var fieldName;
		var fieldValue;
		var queryCtr = -1;
		for (var i = 0; i < queryNameLabels.length; i++)
			if (queryNameLabels[i].name === name)
				queryCtr = i;
		if (queryCtr >= 0) {
			fieldName = queryNameValues.names[queryCtr];
			fieldValue = queryNameValues.vals[queryCtr];

			if (fieldValue.startsWith('javascript:')) {
				var scriptEvaluator = new GlideScriptEvaluator();
				scriptEvaluator.setEnforceSecurity(true);
				fieldValue = scriptEvaluator.evaluateString(fieldValue, false) + "";
			}

			if (queryNameLabels[queryCtr].valid) {
				sampleChangeGr.setValue(fieldName, fieldValue);
				displayValue = sampleChangeGr.getDisplayValue(fieldName);
			} else
				displayValue = fieldValue;
		}

		// The Differ that ends up using these values dies spectacularly when given a null value to diff
		if (typeof displayValue === "undefined" || displayValue == null)
			return "";

		return displayValue;
	},

	//Creates required URL the honours two-step property value for creating change from template form
	getActionURL: function(template) {
		var gu;

		if (this._getBooleanPropertyValue(this.PROP_TWO_STEP, false)) {
			gu = new GlideURL(this.TABLE_NAME_CHANGE + '.do');
			gu.set('sys_id', '-1');
			gu.set('sysparm_query', this.getQueryParams(template));
		} else {
			gu = new GlideURL('std_change_processor.do');
			gu.set('sysparm_id', template.getUniqueValue());
			gu.set('sysparm_action', 'execute_producer');
			gu.set('sysparm_catalog', template.sc_catalogs);
			gu.set('sysparm_ck', gs.getSessionToken());
		}

		return gu.toString();
	},

	getQueryParams: function(template) {
		if (!template)
			return '';

		var chgType = '';
		if (gs.getProperty('com.snc.change_management.change_model.type_compatibility', false) === 'true')
			chgType = this.ATTR_TYPE + '=' + this.DEFAULT_CHG_TYPE;
		else
			chgType = this.ATTR_CHG_MODEL + '=' + this.DEFAULT_CHG_MODEL;

		return chgType + '^std_change_producer_version=' + template.getValue('current_version');
	},

	//Creates a URL to be used when creating a Standard Change from another task (eg: incident)
	getURLForTask: function(record, field) {
		if (!record || !field)
			return;

		var target = 'table:' + record.getTableName();
		target += ';sysid:' + record.getUniqueValue();
		target += ';field:' + field;

		var gu = new GlideURL('com.glideapp.servicecatalog_category_view.do');
		gu.set('v', '1');
		gu.set('sysparm_parent', this._getPropertyValue(this.ATTR_CATEGORY));
		gu.set('sysparm_cartless', 'true');
		gu.set('sysparm_processing_hint', target);

		return gu.toString();
	},

	//Reapplies the values for the readonly fields from the template associated to the change record
	reapplyReadonlyTemplateFields: function(record) {
		if (!record)
			return;

		var evalObj = new GlideScriptEvaluator();
		evalObj.setEnforceSecurity(true);

		var template = new GlideRecord(this.TABLE_NAME_TEMPLATE);
		if (template.get(record.std_change_producer_version.std_change_producer.template)) {
			var readonlyFields = this.getReadOnlyFields();
			var queryValues = this._parseEncodedQuery(template.getValue('template'), true /* noEscape */);

			for (var j = 0; j < readonlyFields.length; j++) {
				var nameIndex = queryValues.names.indexOf(readonlyFields[j]);
				if (nameIndex > -1) {
					var value = queryValues.vals[nameIndex];
					if (value.startsWith("javascript:"))
						value = evalObj.evaluateString(value, false);

					record.setValue(readonlyFields[j], value);
				}
			}
		}
	},

	hasPropertyFieldChanged: function(propertyGr) {
		return propertyGr.mandatory_fields.changes() || propertyGr.restricted_fields.changes() || propertyGr.default_values.changes() || propertyGr.fields_to_copy.changes();
	},

	checkFieldsToCopyWithMandatory: function(mandatoryFields, defaultValues, fieldsToCopy) {
		var changeGr = new GlideRecord(this.TABLE_NAME_CHANGE);
		changeGr.initialize();

		/* First check that the combination of defaulted fields and fields to copy
		   covers all the mandatory fields - if it doesn't we can't copy any Change */
		var missingFields = [];
		var fieldName;
		var defaultFields = this._parseEncodedQuery(defaultValues).names;
		for (var i = 0; i < mandatoryFields.length; i++) {
			fieldName = mandatoryFields[i];
			if (!this.arrayUtil.contains(defaultFields, fieldName) && !this.arrayUtil.contains(fieldsToCopy, fieldName))
				missingFields.push(changeGr[fieldName].getLabel());
		}

		return missingFields;
	},

	_createScriptContent: function(versionId, producerId) {
		var scriptContent = 'current.' + this.ATTR_STD_CHG_PRODUCER_VERSION + ' = "' + versionId + '";\n';
		scriptContent += 'if (gs.getProperty("com.snc.change_management.change_model.type_compatibility", "false") === "true")\n';
		scriptContent += '	current.' + this.ATTR_TYPE + ' = "' + this.DEFAULT_CHG_TYPE + '";\n';
		scriptContent += 'else\n';
		scriptContent += '	current.' + this.ATTR_CHG_MODEL + ' = "' + this.DEFAULT_CHG_MODEL + '";\n';
		scriptContent += 'GlideSysAttachment.copy("' + this.TABLE_NAME_PRODUCER + '", "' + producerId + '", current.getTableName(), current.getUniqueValue());\n';

		return scriptContent;
	},

	_isCloseCodeUnsuccessful: function(closeCode) {
		return Array.isArray(this.CLOSE_CODES_UNSUCCESSFUL) && this.CLOSE_CODES_UNSUCCESSFUL.indexOf(closeCode) >= 0;
	},

	skippedApproval: function(proposalGr) {
        //Requery proposal to make sure the record is not stale
        var propGr = new GlideRecord(this.TABLE_NAME_PROPOSAL);
        if (propGr.get(proposalGr.getUniqueValue())) {
            gs.addErrorMessage(gs.getMessage('No Approver present. Please request System Administrator to configure Approvers'));
            propGr.state = this.STATE_NEW;
            propGr.update();
        }
	},

	rejectedProposalComments: function(proposalGr) {
        // Stamping the rejection comment to proposal record
        var app = new GlideRecord('sysapproval_approver');
        app.addQuery('sysapproval', proposalGr.getUniqueValue());
        app.addQuery('state', 'rejected');
        app.orderByDesc('sys_updated_on');
        app.setLimit(1);
        app.query();

		if(app.next()) {
			var commentsGR = new GlideRecord('sys_journal_field');
			commentsGR.addQuery('element_id', app.getUniqueValue());
			commentsGR.orderByDesc('sys_created_on');
			commentsGR.setLimit(1);
			commentsGR.query();
			if(commentsGR.next()) {
                //Requery proposal to make sure the record is not stale
                var propGr = new GlideRecord(this.TABLE_NAME_PROPOSAL);
                if (propGr.get(proposalGr.getUniqueValue())) {
                    propGr.comments = commentsGR.getValue('value');
                    propGr.state = this.STATE_NEW;
                    propGr.update();
                }
			}
		}
	},

	canViewCategory: function(categoryId) {
		return GlideappCategory.get(categoryId).canView();
	},

	type: 'StdChangeUtilsSNC'
});
