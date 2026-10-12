/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({
	api,
	event,
	helpers,
	imports
}) {
	helpers.modal.close(); //To close contact card and open sidebar modal
	let participantsArray = [];
	participantsArray.push(api.context.props.userSysId);
	api.emit("RECORD#OPEN_COLLAB_CHAT", {
		fields: {
			"parentTable": api.context.props.table,
			"parentSysId": api.context.props.recordSysId,
			"config": {
				'participants': participantsArray,
				'prefill': false,
				'isPermissionCheckNeeded': true
			}
		}
	});
}
