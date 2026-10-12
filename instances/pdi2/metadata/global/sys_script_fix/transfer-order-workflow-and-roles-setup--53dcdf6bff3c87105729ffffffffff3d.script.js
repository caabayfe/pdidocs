var TO_PROPERTY_NAME = 'com.sn_itam.enable_flow_designer.transfer_order';
var logMessages = [];

function logMessage(message) {
	logMessages.push(message);
}

function printLogs() {
	gs.log(logMessages.join('\n'), 'Transfer Order Workflow Deactivation');
}

// Sets the system property com.sn_itam.enable_flow_designer.transfer_order to true
function updateSystemProperty() {
	var propertyValue = 'true';
	gs.setProperty(TO_PROPERTY_NAME, propertyValue);
	logMessage('System property "' + TO_PROPERTY_NAME + '" has been marked as True successfully.');
}

// Disable the legacy workflow
function disableLegacyWorkflow(workflowVersion) {
	logMessage('Marking legacy workflow "' + workflowVersion + '" as inactive. Flow designer flow will be active now.');
	var workflowVersionGr = new GlideRecord('wf_workflow_version');
	if (workflowVersionGr.get(workflowVersion)) {
		workflowVersionGr.setValue('published', false);
		workflowVersionGr.update();
	} else {
		logMessage('No published workflow version found for workflow: ' + workflowVersion);
	}
}

// Process Transfer Order Workflow Migration
function processTOWorkflowMigration(workflowPublishedVersionBAMTO) {
	// First, check if ANY published workflow versions exist for this table
	var allWorkflowsGR = new GlideRecord('wf_workflow_version');
	allWorkflowsGR.addQuery('table', 'alm_transfer_order');
	allWorkflowsGR.addQuery('published', true);
	allWorkflowsGR.query();

	if (!allWorkflowsGR.hasNext()) {
		// No published workflow versions exist - legacy workflows are not active on this instance
		logMessage('No published workflow versions exist for table alm_transfer_order. Legacy workflows not active on this instance.');
		updateSystemProperty();
		return;
	}

	// Workflow versions exist, check for customization
	var workflowGR = new GlideRecord('wf_workflow_version');
	workflowGR.addQuery('table', 'alm_transfer_order');
	workflowGR.addQuery('published', true);
	workflowGR.addQuery('sys_id', workflowPublishedVersionBAMTO);
	workflowGR.query();

	if (workflowGR.next()) {
		logMessage('Customizations not detected in BAM TO Workflow.');
		updateSystemProperty();
		disableLegacyWorkflow(workflowPublishedVersionBAMTO);
	} else {
		logMessage('Customizations detected in BAM TO Workflow. Legacy workflows will remain active.');
	}
}

// Handle workflow migrations
function handleWorkflowMigrations() {
	var workflowPublishedVersionBAMTO = '64a1fd13e7501300c6b80558d2f6a902';

	processTOWorkflowMigration(workflowPublishedVersionBAMTO);

	logMessage('Fix script process completed.');
}

function processInstanceState() {
	if (!GlidePluginManager.isZboot()) {
		// upgrade scenario
		logMessage('This instance is an upgraded instance.');
		handleWorkflowMigrations();
	} else {
		logMessage('This instance is a fresh instance.');
		updateSystemProperty();
		logMessage('System Property has been updated successfully');
	}
}

function updatePropertyRoles() {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', TO_PROPERTY_NAME);
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
