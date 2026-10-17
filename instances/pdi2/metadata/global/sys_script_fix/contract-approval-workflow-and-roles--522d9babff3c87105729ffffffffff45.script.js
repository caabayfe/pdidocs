var CONTRACT_APPROVAL_PROPERTY_NAME = 'com.sn_itam.enable_flow_designer.contract_approval';
var logMessages = [];

function logMessage(message) {
	logMessages.push(message);
}

function printLogs() {
	gs.log(logMessages.join('\n'), 'Contract Approval Workflow Deactivation');
}

// Sets the system property to true
function updateSystemProperty() {
	var propertyValue = 'true';
	gs.setProperty(CONTRACT_APPROVAL_PROPERTY_NAME, propertyValue);
	logMessage('System property "' + CONTRACT_APPROVAL_PROPERTY_NAME + '" has been marked as True successfully.');
}

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

function processContractApprovalWorkflowMigration(workflowPublishedVersionBAMContractApproval) {
	// First, check if ANY published workflow versions exist for this table
	var allWorkflowsGR = new GlideRecord('wf_workflow_version');
	allWorkflowsGR.addQuery('table', 'ast_contract');
	allWorkflowsGR.addQuery('published', true);
	allWorkflowsGR.query();

	if (!allWorkflowsGR.hasNext()) {
		// No published workflow versions exist - legacy workflows are not active on this instance
		logMessage('No published workflow versions exist for table ast_contract. Legacy workflows not active on this instance.');
		updateSystemProperty();
		return;
	}

	// Workflow versions exist, check for customization
	var workflowGR = new GlideRecord('wf_workflow_version');
	workflowGR.addQuery('table', 'ast_contract');
	workflowGR.addQuery('published', true);
	workflowGR.addQuery('sys_id', workflowPublishedVersionBAMContractApproval);
	workflowGR.query();

	if (workflowGR.next()) {
		logMessage('Customizations not detected in BAM Contract Approval Workflow.');
		updateSystemProperty();
		disableLegacyWorkflow(workflowPublishedVersionBAMContractApproval);
	} else {
		logMessage('Customizations detected in BAM Contract Approval Workflow. Legacy workflows will remain active.');
	}
}

function handleWorkflowMigrations() {
	var workflowPublishedVersionBAMContractApproval = '2fe9ba4421231110fa9b367a0a2017d1';
	processContractApprovalWorkflowMigration(workflowPublishedVersionBAMContractApproval);
	logMessage('Fix script process completed.');
}

function processInstanceState() {
	if (!GlidePluginManager.isZboot()) {
		logMessage('This instance is an upgraded instance.');
		handleWorkflowMigrations();
	} else {
		logMessage('This instance is a fresh instance.');
		updateSystemProperty();
	}
}

function updatePropertyRoles() {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', CONTRACT_APPROVAL_PROPERTY_NAME);
	gr.query();
	if (gr.next()) {
		var updated = false;
		if (!gr.getValue('read_roles')) {
			gr.setValue('read_roles', 'contract_system_admin');
			updated = true;
		}
		if (gr.getValue('write_roles') === 'admin') {
			gr.setValue('write_roles', 'contract_system_admin');
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
