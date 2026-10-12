/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	const {
		inputs : {
			taskId
		}
	} = api.data.cert;
	const {
		attributeCheckedState,
		comment
	} = api.state;
	const {
		current: {
			table,
			concatenatedQuery
		},
		selectionProps,
		actionBarProps: {
			daModel: {
				count
			}
		}
	} = api.data.list;
	let query = concatenatedQuery;
	let actionType;
	switch(event.elementId) {
		case 'fail_fields_button':
			actionType = 'fail';
			break;
		case 'certify_fields_button':
			actionType = 'certify';
			break;
		case 'save_comment_button':
		    actionType = 'save_comment';
	}

	api.emit('CERT_CERT_CTRL#UPDATE_ATTR_STATUSES_RELAY_51b5861d536631102a13ddeeff7b12bf', {
		taskId,
		attributes: Object.keys(attributeCheckedState).filter((attr) => attributeCheckedState[attr]),
		action: actionType,
		comment,
		selectProps: {
			table,
			query,
			count,
			...selectionProps
		}
	});

	api.setState('attributeCheckedState', {});
	api.setState('comment', null);
}
