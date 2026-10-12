function script({ api, event, helpers, imports }) {
	//enableEditMode script in Map Search Filter UI Controller; handler for SN_UNIFIED_MAP_CTRL#ENABLE_EDIT_MODE event
	api.emit('SN_UNIFIED_MAP_CTRL#REQUEST_TO_UPDATE_PAGE_PROPS', { params: { editMode: "true" } });
}
