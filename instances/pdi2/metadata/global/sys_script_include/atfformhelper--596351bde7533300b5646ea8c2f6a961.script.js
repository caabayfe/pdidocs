var ATFFormHelper = Class.create();
ATFFormHelper.prototype = {
	initialize: function() {
    },

	/** 
	 * getFormUIAsChoiceList is a deprecated function, consider using getFormUIAsChoiceListWithSysID()
	 */
	getFormUIAsChoiceList: function() {
		var formUIChoiceList = new GlideChoiceList();
		formUIChoiceList.add("standard_ui", gs.getMessage("Standard UI"));

		var gr = new GlideRecord("sys_aw_master_config");
		gr.query();

		while (gr.next())
			formUIChoiceList.add(gr.workspace_url, gr.name);

		return formUIChoiceList;
	},
	
	/** 
	 * Consider using getFormUIAsChoiceListWithSysID() instead of getFormUIAsChoiceList()
	 * Workspace URL will now be calculated using sys_id
	 */
	getFormUIAsChoiceListWithSysID: function() {
		var formUIChoiceList = new GlideChoiceList();
		formUIChoiceList.add("standard_ui", gs.getMessage("Standard UI"));

		// Now do configurable workspace
		var workspacesGR = new GlideRecord("sys_ux_registry_m2m_category");
		// Workspace experience category
		workspacesGR.addQuery("experience_category", "afb4e3e173322010f0ca1e666bf6a726");
		workspacesGR.query();

		while (workspacesGR.next())
			formUIChoiceList.add(workspacesGR.getValue("page_registry"), workspacesGR.page_registry.title);

		return formUIChoiceList;
	},

	getFormDeclarativeAction: function(tableName) {
		return "model=360935e9534723003eddddeeff7b127d^table=" + tableName;
	},

    type: 'ATFFormHelper'
};
