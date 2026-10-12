function script({api, event, imports}) {  
	const recordCtrlUtils = imports['sn_record_page.recordPageControllerUtils'](...arguments);
	recordCtrlUtils.onSidebarTabItemsChanged(event.payload.tabs);
}
