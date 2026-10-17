(function () {
	data.ACTION_TODO_COUNT = 'update_todo_count';
	data.ACTION_LOAD_CASES = 'load_cases';
	data.isMobile = gs.isMobile();
	var isHrCoreActive = GlidePluginManager().isActive('com.sn_hr_core');
	if (isHrCoreActive) {
		data.isHrCoreActive = true;
		//Load To-dos count
		if (!input || input.action == data.ACTION_TODO_COUNT) {
			data.todoCount = new sn_hr_sp.hr_DashboardUtil().getHeaderTodoCount();
			if (input)
				return;
		}
		//Load To-dos widget if requested
		if (input && input.action == data.ACTION_LOAD_CASES) {
			data.todoCaseList = $sp.getWidget('hrk-header-case-list', {isTodoList : true});
			data.caseList = $sp.getWidget('hrk-header-case-list', {isTodoList : false});
			if (input)
			return;
		} 	

		// HR Profile
		var gr = new GlideRecord('sn_hr_core_profile');
		gr.addQuery('user', gs.getUserID());
		gr.query();
		if (!gr.next() && new GlideRecord('sys_user').get(gs.getUserID())) {
			gr.setValue('user', gs.getUserID());
			gr.insert();
		}
		data.email = gs.getProperty('sn_hr_core.hr_email');
	}
	// populate the 'data' object
	data.link = '?id=hri_user_profile&sys_id='+ gs.getUserID();

	// Check for chat properties
	data.chatSupportEnabled = gs.getProperty('glide.connect.enabled', 'false') == 'true' && gs.getProperty('glide.connect.support.enabled', 'false') == 'true';

	// Defines the support queue ID that will be linked to by the Live Chat link in header
	data.login_page = $sp.getValue('login_page');
	var menu = $sp.getValue("sp_rectangle_menu");
	data.menu = $sp.getWidgetFromInstance(menu);
	if (data.menu && data.menu.data) {
		data.menu.data.replace = true;
		// Hide login if menu already has link to login
		data.hasLogin = false;
		if (data.menu.data.menu.items) {
			for(var i in data.menu.data.menu.items) {
				var item = data.menu.data.menu.items[i];
				if (item.type == 'page' && item.sp_page == data.login_page)
					data.hasLogin = true;
			}
		}
	}

	data.loginWidget = $sp.getWidgetFromInstance('login-modal');
	data.typeahead = $sp.getWidgetFromInstance('typeahead-search');
})();
