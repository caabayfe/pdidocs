/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	const payload = (((api.data
		|| {}).playbook_experience_trigger_playbook_if_not_running_mutation
		|| {}).output
	) || {};
	const triggerPlaybookResponse = ((((payload.data
		|| {}).snPlaybookExp
		|| {}).playbook
		|| {}).triggerPlaybook) || {};

	const gqlErrors = payload.errors || [];

	if (gqlErrors.length > 0 || triggerPlaybookResponse.errorType) {
		const errors =
			gqlErrors.length > 0 ? gqlErrors : [triggerPlaybookResponse];
		api.emit("PLAYBOOK_INTERNAL#TRIGGER_PLAYBOOK_FAILED", { errors });
	}

	const { parent_table = null, parent_record = null } = triggerPlaybookResponse;
	if (parent_table && parent_record)
		api.emit("PLAYBOOK_INTERNAL#RECORD_GENERATED", {
			table: parent_table,
			sysId: parent_record
		});
}
