function handler({api, event, imports}) {
    api.emit('SCREEN_STATUS_CHANGED', {status: 'closed', skipNextScreenActivation: true});
    
    const {parent_sys_id, table, sysId, title, query} = event.payload;
    let targetRoute = '';
    if (parent_sys_id)
    	targetRoute = 'current';
    
    let payload = {route: 'record'};
    payload.fields = {table, sysId};
    payload.targetRoute = targetRoute;
    payload.title = title;
    if (query) {
        payload.query = query;
        payload.params = { query: query };
    }
	console.log(payload);
    api.emit('NAV_ITEM_SELECTED', payload);
}
