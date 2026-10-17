/**
* @param {params} params
* @param {api} params.api
* @param {event} params.event
* @param {imports} params.imports
* @param {helpers} params.helpers
*/
function refreshRelatedLists({api, event, imports}) {
	const rlName = event.payload.relatedListName;
	if (typeof rlName !== 'string' || rlName.length === 0)
		return;
	const newList = api.state.relatedLists.map( item => {
		return {...item};
	});
	const targetList = newList.find( item => rlName === item.relatedListName);
	if(!targetList)
		return;
	targetList.refreshRequested = {timestamp: Date.now()};
	api.setState('relatedLists', newList);

}
