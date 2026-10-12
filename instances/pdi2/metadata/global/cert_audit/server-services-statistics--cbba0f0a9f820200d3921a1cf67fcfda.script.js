new SNC.CertificationProcessing().runAudit(current.sys_id, current.template.filter.sys_id, current.template.sys_id);
/*
/////////////////////////////////////////////////////
/// This script works with Data Center Zones filter //
/////////////////////////////////////////////////////

var desiredFloorSpaceUsage = 30;		// Value to audit against
var assignToUser = '46d44a23a9fe19810012d100cca80666';	 // Beth Anglin
var assignToGroup = '8a5055c9c61122780043563ef53438e3';	// Hardware group
var taskMsg = 'See the audit results below for the discrepancies that must be addressed';

// API call to retrieve records based on the filter
var gr = new SNC.CertificationProcessing().getFilterRecords(current.filter);

// Loop over all records defined by the filter
while(gr.next()) {
	var sysId = gr.getValue('sys_id');	// Sys ID of audited record
	var floorSpaceInUse = gr.getValue('floor_space_in_use');	// Value to audit

	// Determine if certification condition passes or fails
	if (floorSpaceInUse < desiredFloorSpaceUsage) {
		var columnNameSpace = gr.floor_space_in_use.getLabel();	// String value of column audited against

		// Call create Follow on Task API and save the returned sys_id for use in logging audit result fail
		// Params: 
		// auditId - Sys id of the audit record executed
		// ciId Sys - id of the configuration item.  Empty string if not a cmdb ci
		// assignedTo - Sys id of user to assign task to.  Can be empty
		// assignmentGroup - Sys id of group to assign task to.  Can be empty
		// shortDescr - Short description for the Follow On Task.  Can be empty
		// Return value: Sys id of the created follow on task
		var followOnTask = new SNC.CertificationProcessing().createFollowOnTask(current.sys_id, sysId, assignToUser, '', taskMsg);

		// Call log failed result API
		// Params:
		// auditId - Sys id of audit record executed
		// auditedRecordId - Sys id of the record audited
		// followOnTask - Sys id of the follow on task associated with the audited record(@see auditedRecordId). Can be empty
		// columnDisplayName - Label of the column audited(ex. Disk space (GB)).  Can be empty
		// operatorLabel - Label of the operator used to audit the column(ex. is not empty, greater than). Can be empty
		// desiredValue - Desired value of the column.  Can be empty
		// discrepancyValue - Discrepancy value.  Can be empty
		// isCI - True, if audited record is a CI. False, otherwise.
		// domainToUse - Sys domain of the "cert_audit" record.  Can be empty
		new SNC.CertificationProcessing().logAuditResultFail(current.sys_id, sysId, followOnTask, columnNameSpace, 'greater than', desiredFloorSpaceUsage, floorSpaceInUse, true);
	} else { // If certification condition pass, write a Audit Result Pass via API
		// Params:
		// auditId - Sys id of audit record executed
		// auditedRecordId - Sys id of the record audited
		// isCI - True, if audited record is a CI. False, otherwise.  Can be empty.
		// domainToUse - Sys domain of the "cert_audit" record.  Can be empty.
		new SNC.CertificationProcessing().logAuditResultPass(current.sys_id, sysId, true);
	}
}
*/
