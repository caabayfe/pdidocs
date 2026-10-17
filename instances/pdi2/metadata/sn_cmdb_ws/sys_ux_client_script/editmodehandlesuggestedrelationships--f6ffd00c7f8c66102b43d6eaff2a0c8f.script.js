function script({ api, event, helpers, imports }) {
	//editModeHandleSuggestedRelationships script in Map Search Filter UI Controller
	const { buildEditModeConnectionList } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var functions = {
		editModeHandleSuggestedRelationships: function () {
			var showSuggestedRels = !!event.payload.showSuggestedRels;
			api.setState('showSuggestedRels', showSuggestedRels);

			var dropdownItems = buildEditModeConnectionList(api, showSuggestedRels);
			api.setState('editModeConnectionTypeDropdownItems', dropdownItems);
		}
	};
	functions.editModeHandleSuggestedRelationships();
}
