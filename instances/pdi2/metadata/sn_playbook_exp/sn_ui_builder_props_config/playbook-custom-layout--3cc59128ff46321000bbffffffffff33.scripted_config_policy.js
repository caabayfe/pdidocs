// This script sets logical behavior for the Playbook Custom Layout controller config modal in UIB
function playbookControllerPolicy(args) {
	// args.trigger is null on first load of the config
	// every check should run on first load so that all the expected values are set based on previous config
	var isBootstrap = args.trigger === null;

	// Helper function to set default table and sys_id
	function prefillTable() {
		args.api.updateProperty('inputParentTable', { value: 'sys_playbook_execution' });
		// Note we cannot dynamically bind the sysId to be @context.props.sysId due to UIB limitation
		// Setting the parentSysId to -1 here would force the output of the parentSydId to always be -1
		// which would cause the runtime playbook stuck at the record generator
		//args.api.updateProperty('inputParentSysId', { value: '-1' });		
	}

	// Handles when hasParentRecord is checked
	function hasParentRecordChecked(hasParentRecord) {
		args.api.updateProperty('inputParentTable', { isVisible: hasParentRecord });
		args.api.updateProperty('inputParentSysId', { isVisible: hasParentRecord });
		args.api.updateProperty('inputPlaybookExecutionId', { isVisible: !hasParentRecord });

		// If "hasParentRecord" is off then we always set the table to sys_playbook_execution and the sys id to -1
		if (!hasParentRecord) {
			prefillTable();
		}
	}

	// Helper function to recalculate the record generator query
	function calculateRecordGeneratorQuery(currentRecordGeneratorQuery, processDefinitionId) {
		var PROCESS_DEFINITION_ID_AND_EQUAL_SIGN = 'processDefinitionId=';

		// scenario 1: Is no process definition is set, use the current record generator query
		if (!processDefinitionId) {
			return currentRecordGeneratorQuery;
		}

		// If processDefinitionId is set, reconsolidate the recordGeneratorQuery
		var processDefinitionParam = PROCESS_DEFINITION_ID_AND_EQUAL_SIGN + processDefinitionId;
		var updatedQuery;

		if (!currentRecordGeneratorQuery) {
			// Scenario 2: currentRecordGeneratorQuery is empty - set it directly
			updatedQuery = processDefinitionParam;
		} else if (currentRecordGeneratorQuery.includes(PROCESS_DEFINITION_ID_AND_EQUAL_SIGN)) {
			// Scenario 3: currentRecordGeneratorQuery contains processDefinitionId - replace it
			updatedQuery = currentRecordGeneratorQuery.replace(
				new RegExp(PROCESS_DEFINITION_ID_AND_EQUAL_SIGN + '[^^]*'),
				processDefinitionParam
			);
		} else {
			// Scenario 4: currentRecordGeneratorQuery exists but doesn't contain processDefinitionId - append it
			updatedQuery = `${currentRecordGeneratorQuery}^${processDefinitionParam}`;
		}

		return updatedQuery;
	}

	// Hendles when processDefinition is changed
	function processDefinitionChanged(processDefinitionId) {
		var currentRecordGeneratorQuery = args.properties.inputRecordGeneratorQuery;
		var calculatedQuery = calculateRecordGeneratorQuery(currentRecordGeneratorQuery, processDefinitionId);
		// Update the property to be used by the graphql data broker
		args.api.updateProperty('calculatedRecordGeneratorQuery', { value: calculatedQuery });
	}

	var currentHasParentRecord = args.properties.inputHasParentRecord;
	var currentInputTable = args.properties.inputParentTable;
	var currentInputSysId = args.properties.inputParentSysId;
	var isInputParentTableSet = currentInputTable || args.api.isDynamic('inputParentTable');
	var isInputParentSysIdSet = currentInputSysId || args.api.isDynamic('inputParentSysId');
	var isInputTableSetToPlaybookExecution = currentInputTable === 'sys_playbook_execution';
	var shouldCheckHasParentRecord = (isInputParentTableSet && !isInputTableSetToPlaybookExecution && isInputParentSysIdSet) ? true : false;

	if (isBootstrap) {
		args.api.updateProperty('inputHasParentRecord', { value: shouldCheckHasParentRecord });
		hasParentRecordChecked(shouldCheckHasParentRecord);
	}

	if (args.trigger === 'inputHasParentRecord') {
		hasParentRecordChecked(currentHasParentRecord);
	}

	var currentProcessDefinition = args.properties.inputProcessDefinition || args.api.isDynamic('inputProcessDefinition');
	if (args.trigger === 'inputProcessDefinition' || args.trigger === 'inputRecordGeneratorQuery' || isBootstrap) {
		if (currentProcessDefinition) {
			args.api.updateProperty('process_input_table', { value: 'var__m_sys_pd_process_input_' + currentProcessDefinition});
			processDefinitionChanged(currentProcessDefinition);
		} else {
			args.api.updateProperty('process_input_table', { value: '' });
			processDefinitionChanged('');
		}
    }

	args.api.updateProperty('inputOverrideInputs', { isVisible: currentProcessDefinition ? true : false});
}
