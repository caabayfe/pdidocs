var TOL_PROPERTY_NAME = 'com.sn_itam.enable_flow_designer.transfer_order_line';
var logMessages = [];

function logMessage(message) {
	logMessages.push(message);
}

function printLogs() {
	gs.log(logMessages.join('\n'), 'TOL Workflow Deactivation');
}

// Sets the system property to true
function updateSystemProperty() {
	var propertyValue = 'true';
	gs.setProperty(TOL_PROPERTY_NAME, propertyValue);
	logMessage('System property "' + TOL_PROPERTY_NAME + '" has been marked as True successfully.');
}

function disableLegacyWorkflow(workflowVersion) {
	logMessage('Marking legacy workflow "' + workflowVersion + '" as inactive. Flow designer flow will be active now.');
	var workflowVersionGr = new GlideRecord('wf_workflow_version');
	if (workflowVersionGr.get(workflowVersion)) {
		workflowVersionGr.setValue('published', false);
		workflowVersionGr.update();
	}
}

function processTOLWorkflowMigration(workflowPublishedVersionBAMTOL) {
	// First, check if ANY published workflow versions exist for this table
	var allWorkflowsGR = new GlideRecord('wf_workflow_version');
	allWorkflowsGR.addQuery('table', 'alm_transfer_order_line');
	allWorkflowsGR.addQuery('published', true);
	allWorkflowsGR.query();

	if (!allWorkflowsGR.hasNext()) {
		// No published workflow versions exist - legacy workflows are not active on this instance
		logMessage('No published workflow versions exist for table alm_transfer_order_line. Legacy workflows not active on this instance.');
		updateSystemProperty();
		return;
	}

	// Workflow versions exist, proceed with customization check
	var isFsmEnabled = GlidePluginManager.isActive('com.snc.service_management.core');
	var workflowGR = new GlideRecord('wf_workflow_version');
	workflowGR.addQuery('table', 'alm_transfer_order_line');
	workflowGR.addQuery('published', true);
	workflowGR.query();

	var activeWorkflowSysIds = [];
	while (workflowGR.next()) {
		activeWorkflowSysIds.push(workflowGR.getUniqueValue());
	}

	var isNotCustomVersionBAM = false;
	var expectedWorkflowCount = isFsmEnabled ? 2 : 1;

	if (activeWorkflowSysIds.length !== expectedWorkflowCount) {
		logMessage('Count not matched for TOL Workflow. Legacy workflows will remain active. Count: ' + activeWorkflowSysIds.length);
	} else {
		if (!activeWorkflowSysIds.includes(workflowPublishedVersionBAMTOL)) {
			logMessage('Customizations detected in BAM TOL Workflow. Legacy workflows will remain active.');
		} else {
			isNotCustomVersionBAM = true;
			logMessage('Customizations not detected in BAM TOL Workflow.');
		}

		if (!isFsmEnabled) {
			if (isNotCustomVersionBAM) {
				updateSystemProperty();
				disableLegacyWorkflow(workflowPublishedVersionBAMTOL);
			} else {
				logMessage('Customization found. Legacy workflows will remain active.');
			}
		} else {
			logMessage('Field Service Management plugin is installed. Workflow deactivation will be handled by the TOL SMCore Workflow Deactivation fix script.');
		}
	}
}

function handleWorkflowMigrations() {
	var workflowPublishedVersionBAMTOL = 'f1bf2a05e7c133009a610558d2f6a94b';
	processTOLWorkflowMigration(workflowPublishedVersionBAMTOL);
	logMessage('Fix script process completed.');
}

function processInstanceState() {
	if (!GlidePluginManager.isZboot()) {
		logMessage('This instance is an upgraded instance.');
		handleWorkflowMigrations();
	} else {
		logMessage('This instance is a fresh instance.');
		updateSystemProperty();
		logMessage('System Property has been updated successfully.');
	}
}

function updatePropertyRoles() {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', TOL_PROPERTY_NAME);
	gr.query();
	if (gr.next()) {
		var updated = false;
		if (!gr.getValue('read_roles')) {
			gr.setValue('read_roles', 'asset_system_admin');
			updated = true;
		}
		if (gr.getValue('write_roles') === 'admin') {
			gr.setValue('write_roles', 'asset_system_admin');
			updated = true;
		}
		if (updated) {
			gr.update();
		}
	}
}

// Main execution
processInstanceState();
updatePropertyRoles();
printLogs();
