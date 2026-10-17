function ProblemModalUIHelpers() {

	var initialFrameHeight = -1;
	var initialFrameWidth = -1;
	var modalName;

	function setModalWidthAndHeight(width, height) {

		width = width || initialFrameWidth;
		height = height || initialFrameHeight;
		if (height == -1)
			height = 100;
		jQuery('#' + modalName + ' .modal-body').css({
			minHeight: height
		});
	}
	CustomEvent.un('content_frame.resized', ProblemModalUIHelpers.onIFrameEventListener);
	CustomEvent.un('frame.resized', ProblemModalUIHelpers.onIFrameEventListener);
	
	var adjustedHeight = 0; // Caching value that was last adjusted to avoid recurrent updates - DEF0191449
	ProblemModalUIHelpers.onIFrameEventListener = function(name, frameHeight) {
		if (name !== "glide_modal_iframe")
			return;
		if (!frameHeight)
			return;
		// If the next trigger is a result of previous adjustment simply return. 
		if (Math.abs(frameHeight - adjustedHeight) <= 5)
			return;
		
		if (initialFrameHeight == -1)
			initialFrameHeight = frameHeight;
		
		adjustedHeight = frameHeight + 5; // Add 5px to give sufficient height for scroll to disappear when style is 'auto'
		setModalWidthAndHeight(initialFrameWidth, adjustedHeight);
	};

	function registerIframeEvents() {
		CustomEvent.on('content_frame.resized', ProblemModalUIHelpers.onIFrameEventListener);
		CustomEvent.on('frame.resized', ProblemModalUIHelpers.onIFrameEventListener);
	}

	this.getFieldsToUpdate = function(gForm, table) {
		var fieldsToUpdate = {}, field = '', fieldName = '';
		var allFieldsModified = decodeURIComponent(gForm.serializeChangedAll());
		var fieldsModified = allFieldsModified.split('&').filter(
			function(modifiedField) { 
				return modifiedField.indexOf(table) === 0;
			});

		for (var i = 0; i < fieldsModified.length; i++) {
			field = fieldsModified[i]; // Ex: problem.subcategory=os
			if (field != '' && field.indexOf('=') > 0) {
				fieldName = field.split('=')[0];
				if (table == "problem")
					fieldName = fieldName.substring(8);
				if (table == "problem_task")
					fieldName = fieldName.substring(13);

				fieldsToUpdate[fieldName] = gForm.getValue(fieldName);
			}
		}
		return fieldsToUpdate;
	};

	//dataActionName is the UIActionName from which the openModal is triggered and is used to refocus back on the action on closure of the modal
	this.openModal = function(viewName, title, width, formValues, dataActionName) {
		var tableName = g_form.getTableName();

		//get modified fields from parent g_form
		var fieldsFromParent = this.getFieldsToUpdate(g_form, tableName);

		var url = tableName + ".do?sys_id=" + g_form.getUniqueValue();
		url += "&sysparm_stack=no&sysparm_view=" + viewName + "&sysparm_titleless=true&sysparm_form_only=true&sysparm_view_forced=true";

		modalName = viewName;
		initialFrameWidth = width || 850;
		var modal = new GlideModal(viewName, false, "modal-lg", 350);
		modal.setTitle(title);
		modal.setBackdropStatic(true);
		modal.setPreference('focusTrap', true);
		var thisForm = g_form;
		var modalBody;
		registerIframeEvents();
		ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
			modal.template = glideModalTemplate;
			modal.on('bodyrendered', function(event) {
				glideModalKeyDownHandler(event, modal.getID());
			});
			
			modal.on('closeconfirm', function() {
				setTimeout(function() {
					var triggeredElement = document.querySelectorAll('[data-action-name=\''  + dataActionName  + '\']')[0];
					if(typeof triggeredElement !== "undefined")
						triggeredElement.focus();
				});
			});
			
			modal.renderIframe(url, function() {
				this.window.name = "glide_modal_iframe";
				setModalWidthAndHeight(width);
				var g_form_modal = this.window.g_form;
				this.window["g_iframe_height"] = undefined;

				jQuery(this.window.document.body,
					".outputmsg_div #output_messages #close-messages-btn").on('click', function(e) {
					if (e.target.id == 'close-messages-btn')
						setModalWidthAndHeight();
				});

				jQuery("#" + modalName + " .modal-header .close").on('click', function(e) {
					g_form.setValue("state", g_scratchpad.originalState);
					if(g_form.getTableName() == "problem")
						g_form.setValue("resolution_code", g_scratchpad.originalResolutionCode);
					if(g_form.getTableName() == "problem_task")
						g_form.setValue("close_code", g_scratchpad.originalCloseCode);
				});

				if (g_form_modal) {
					for (var prop in formValues)
						g_form_modal.setValue(prop, formValues[prop]);
					for (var field in fieldsFromParent)
						g_form_modal.setValue(field, fieldsFromParent[field]);

					//Informing users that the marking of duplicate of the current problem will lead to async ( background )  movement of related records ( This message only shows up if there is a atleast one related record)
					if (dataActionName == 'mark_duplicate') {
						var triggeredElement = document.querySelectorAll('[id="problem.state"]')[0];
						if (typeof triggeredElement !== "undefined")
							triggeredElement.focus();
						var ga = new GlideAjax('ProblemUtilsClientSNC');
						ga.addParam('sysparm_name', 'isDisplayBackgroundMoveMessage');
						ga.addParam('sysparm_srcPrbSysId', g_form.getUniqueValue());
						ga.getXMLAnswer(processMessageBackgroundMove);
					}
				}
				function processMessageBackgroundMove(answer) {
					if (answer === 'true') {
					    g_form_modal.addInfoMessage(getMessage("Marking this problem as a duplicate will move related records to the Duplicate of problem as a background task"));
					}
				}
			});
		});
	};
}

ProblemModalUIHelpers.onAssess = function() {
	var view = g_form.getViewName();
	if (!g_form.hasField("state")) {
		getMessage('Cannot assess the Problem as \'State\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	g_form.setValue('state', g_scratchpad.STATE.ASSESS);
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}

	g_form.clearMessages();
	var ob = new ProblemModalUIHelpers();
	var formValues = {
		state: g_scratchpad.STATE.ASSESS
	};
	ob.openModal('assess_dialog_form_view', getMessage('Assess'), 850, formValues, "move_to_assess"); // The Modal has also been used in the Business Rule <Update Problem State to Assess>
};

ProblemModalUIHelpers.onFix = function() {
	var view = g_form.getViewName();
	if (!g_form.hasField("state")) {
		getMessage('Cannot proceed to fix the Problem as \'State\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	g_form.setValue("state", g_scratchpad.STATE.FIX_IN_PROGRESS);
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}

	g_form.clearMessages();
	var sysId = g_form.getUniqueValue();
	var ob = new ProblemModalUIHelpers();

	var formValues = {
		state: g_scratchpad.STATE.FIX_IN_PROGRESS
	};
	ob.openModal('start_fix_dialog_form_view', getMessage('Fix'), 850, formValues, "move_to_fix_in_progress");
};

ProblemModalUIHelpers.onMarkDuplicate = function() {
	if (!g_form.hasField("state") || !g_form.hasField("resolution_code")) {
		getMessage('Cannot mark the Problem duplicate as atleast one of the following fields are not visible: \'State\' \'Resolution code\'', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	g_form.setValue("state", g_scratchpad.STATE.CLOSED);
	g_form.setValue("resolution_code", g_scratchpad.RESOLUTION_CODES.DUPLICATE);
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}
	g_form.clearMessages();
	var sysId = g_form.getUniqueValue();

	var formValues = {
		state: g_scratchpad.STATE.CLOSED,
		resolution_code: g_scratchpad.RESOLUTION_CODES.DUPLICATE
	};
	var ob = new ProblemModalUIHelpers();
	ob.openModal("mark_duplicate_dialog_form_view", getMessage('Mark Duplicate'), 850, formValues, "mark_duplicate");
};

ProblemModalUIHelpers.onAcceptingRisk = function() {
	if (!g_form.hasField("state")) {
		getMessage('Cannot accept risk for the Problem as atleast one of the following fields are not visible: \'State\' \'Resolution code\'', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	var sysId = g_form.getUniqueValue();
	var moveToClosed = g_scratchpad.PROP_MOVE_TO_CLOSED;
	var stateValue = moveToClosed == 'true' ? g_scratchpad.STATE.CLOSED : g_scratchpad.STATE.RESOLVED;
	g_form.setValue("state", stateValue);
	g_form.setValue("resolution_code", g_scratchpad.RESOLUTION_CODES.RISK_ACCEPTED);
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}

	g_form.clearMessages();
	var formValues = {
		state: stateValue,
		resolution_code: g_scratchpad.RESOLUTION_CODES.RISK_ACCEPTED
	};
	var ob = new ProblemModalUIHelpers();
	ob.openModal("accept_risk_dialog_form_view", getMessage('Accept Risk'), 900, formValues, "accept_risk");
};

ProblemModalUIHelpers.ProblemTask_MoveToAssess = function() {
	var view = g_form.getViewName();

	if (!g_form.hasField('state')) {
		getMessage('Cannot Assess the Problem task as \'State\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	var sysId = g_form.getUniqueValue();
	g_form.setValue('state', g_scratchpad.PRBTASK_STATES.ASSESS);
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}
	g_form.clearMessages();
	var formValues = {
		state: g_scratchpad.PRBTASK_STATES.ASSESS
	};
	var ob = new ProblemModalUIHelpers();
	ob.openModal("ptask_assess_dialog_view", getMessage('Assess'), 850, formValues, "state_to_assess"); // The Modal has also been used in the Business Rule <Update Problem Task State to Assess>
};

ProblemModalUIHelpers.ProblemTask_MoveToClosedComplete = function() {
	if (!g_form.hasField('state') || !g_form.hasField('close_code')) {
		getMessage('Cannot Complete the Problem task as \'State\' or \'Close code\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	var sysId = g_form.getUniqueValue();
	g_form.setValue('state', g_scratchpad.PRBTASK_STATES.CLOSED);
	g_form.setValue("close_code", "completed");
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}
	g_form.clearMessages();
	var width = 850;
	var modalName = "ptask_complete_dialog_view_1";

	if (g_form.getValue("problem_task_type") != "rca") {
		width = 900;
		modalName = "ptask_complete_dialog_view_2";
	}
	var formValues = {
		state: g_scratchpad.PRBTASK_STATES.CLOSED,
		close_code: 'completed'
	};
	var ob = new ProblemModalUIHelpers();
	ob.openModal(modalName, getMessage("Complete"), width, formValues, "state_to_closed_completed");
};



ProblemModalUIHelpers.ProblemTask_MoveToClosedCanceled = function() {
	if (!g_form.hasField('state') || !g_form.hasField('close_code')) {
		getMessage('Cannot Assess the Problem task as \'State\' or \'Close code\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	g_form.setValue('state', g_scratchpad.PRBTASK_STATES.CLOSED);
	g_form.setValue("close_code", "canceled");

	var sysId = g_form.getUniqueValue();
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}
	g_form.clearMessages();
	var formValues = {
		state: g_scratchpad.PRBTASK_STATES.CLOSED,
		close_code: "canceled"
	};
	var ob = new ProblemModalUIHelpers();
	ob.openModal("ptask_cancel_dialog_view", getMessage('Cancel'), 850, formValues, "state_to_closed_canceled");
};

ProblemModalUIHelpers.onOk = function(table) {
	var fieldsToUpdate = {};
	fieldsToUpdate["state"] = g_form.getValue("state");
	if (table == "problem")
		fieldsToUpdate["resolution_code"] = g_form.getValue("resolution_code");
	if (table == "problem_task")
		fieldsToUpdate["close_code"] = g_form.getValue("close_code");

	//get modified fields on the parent form
	var ob = new ProblemModalUIHelpers();
	var fieldsModifiedOnParent = ob.getFieldsToUpdate(parent.g_form, table);
	for (var parentField in fieldsModifiedOnParent) {
		fieldsToUpdate[parentField] = fieldsModifiedOnParent[parentField];
	}
	
	//get modified fields on the modal form
	var fieldsModifiedOnModal = ob.getFieldsToUpdate(g_form, table);
	for (var modalField in fieldsModifiedOnModal) {
		fieldsToUpdate[modalField] = fieldsModifiedOnModal[modalField];
	}

	//making the GlideAJAX call 
	var ga = new GlideAjax('ProblemUtilsClientSNC');
	ga.addParam('sysparm_name', 'submitForm');
	ga.addParam('sysparm_record_type', table);
	ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
	ga.addParam('sysparm_fields', JSON.stringify(fieldsToUpdate));
	ga.getXMLAnswer(responseHandler);

	function responseHandler(answer) {
		if (answer == "true") {
			//setting modified flag to false to avoid browser reload confirmation dialog
			CustomEvent.fireAll('form.isModified', { uniqueValue: g_form.getUniqueValue(), isModified: false });
			parent.g_form.modified = false;
			g_form.modified = false;
			parent.window.reloadWindow(parent.window);
		}
	}
};

ProblemModalUIHelpers.problem_Cancel = function() {
	if (!g_form.hasField("state") || !g_form.hasField("resolution_code")) {
		getMessage('Cannot Cancel the Problem as atleast one of the following fields are not visible: \'State\' \'Resolution code\'', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	var sysId = g_form.getUniqueValue();
	g_form.setValue("state", g_scratchpad.STATE.CLOSED);
	g_form.setValue("resolution_code", g_scratchpad.RESOLUTION_CODES.CANCELED);
	if (g_form.mandatoryCheck()) {
		g_form.save();
		return;
	}

	g_form.clearMessages();
	var formValues = {
		state: g_scratchpad.STATE.CLOSED,
		resolution_code: g_scratchpad.RESOLUTION_CODES.CANCELED
	};
	var ob = new ProblemModalUIHelpers();
	ob.openModal("cancel_dialog_form_view", getMessage('Cancel'), 850, formValues, "cancel_problem");
};
