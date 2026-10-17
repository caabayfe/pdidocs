/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, imports}) {
  let type = '';
	if(event.name === "NOW_RECORD_LIST_CONNECTED#SAVE_AS_REQUESTED") {
		type = "CREATE";
	}
	else if (event.name  ===  "NOW_RECORD_LIST_CONNECTED#DELETE_REQUESTED") {
		type = "DESTROY";
	}
	else if (event.name  ===  "NOW_RECORD_LIST_CONNECTED#RENAME_REQUESTED" ||  event.name  ===  "NOW_RECORD_LIST_CONNECTED#EDIT_COLUMNS_REQUESTED" || event.name  === "NOW_RECORD_LIST_CONNECTED#SAVE_REQUESTED") {
		type = "UPDATE";
	}

	const CRUD = {
		type: type,
		options: event.payload.update,
		timestamp: event.payload.timestamp
	};
	
	api.setState('CRUD', CRUD);
}
