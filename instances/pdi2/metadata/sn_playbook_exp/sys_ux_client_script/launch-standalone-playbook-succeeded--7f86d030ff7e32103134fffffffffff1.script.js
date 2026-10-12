/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	const payload = (((api.data
		|| {}).launch_standalone_playbook
		|| {}).output
	) || {};

	const launchPlaybookResponse = ((((payload.data
		|| {}).snPlaybookExp
		|| {}).playbook
		|| {}).launchPlaybook) || {};

	const gqlErrors = payload.errors || [];

	if (gqlErrors.length > 0 || launchPlaybookResponse.errorType) {
		const errors =
			gqlErrors.length > 0 ? gqlErrors : [launchPlaybookResponse];
		api.emit("PLAYBOOK_INTERNAL#LAUNCH_PLAYBOOK_FAILED", { errors });
		return;
	}

	const { parent_table = null, parent_record = null, sys_id = null } = launchPlaybookResponse;
	if (parent_table && parent_record) {
		api.emit("PLAYBOOK_INTERNAL#RECORD_GENERATED", {
			table: parent_table,
			sysId: parent_record,
			contextId: sys_id
		});
	}
}
