(function () {
	data.ACTION_TODO_COUNT = 'update_todo_count';
	data.ACTION_LOAD_CASES = 'load_cases';
	data.isMobile = gs.isMobile();

	data.isVAActive = new GlidePluginManager().isActive("com.glide.cs.chatbot");

	data.chatSupportEnabled = new sn_hr_sp.hr_PortalUtil().isChatSupportEnabled();

	//Load To-dos count
	if (!input || input.action == data.ACTION_TODO_COUNT) {
		var myTodosCountObject= new sn_hr_sp.todoPageUtils().getMyTodosCount();
		data.todoCount = myTodosCountObject.todoCount;
		data.todoCountLabel = gs.getMessage("{0} to-dos remaining");
		data.recordWatchers = myTodosCountObject.recordWatchers;

		// avoid consecutive calls 
		if(input)
			return ;
	}

	data.isHrCoreActive = GlidePluginManager().isActive("com.sn_hr_core");

	if (data.isHrCoreActive && gs.getProperty('sn_hr_core.esc.create_hrprofile.override', 'true') === "true") {

		// HR Profile
		var hrProfileGr = new GlideRecord('sn_hr_core_profile');
		hrProfileGr.addQuery('user', gs.getUserID());
		hrProfileGr.setLimit(1);
		hrProfileGr.query();
		if (!hrProfileGr.hasNext() && gs.getUserID() && new GlideRecord('sys_user').get(gs.getUserID())) {
			hrProfileGr.setValue('user', gs.getUserID());
			hrProfileGr.insert();
		}
	}

	// populate the 'data' object
	data.link = '?id=hri_user_profile&sys_id='+ gs.getUserID();

	// Defines the support queue ID that will be linked to by the Live Chat link in header
	data.login_page = $sp.getValue('login_page');

	var menu = $sp.getValue("sp_rectangle_menu");
	//Initialize menu objects
	data.sub = {};
	data.top = {};
	data.sub.menu = $sp.getWidgetFromInstance(menu);

	//Copy sub menu to top menu, we want cart up top and menu items in the sub nav

	data.top.menu = JSON.parse(JSON.stringify(data.sub.menu));
	if (data.sub.menu && data.sub.menu.data) {
		data.sub.menu.data.replace = true;
		// Hide login if menu already has link to login
		data.hasLogin = false;
		if (data.sub.menu.data.menu.items) {
			for(var i in data.sub.menu.data.menu.items) {
				var item = data.sub.menu.data.menu.items[i];
				if (item.type == 'page' && item.sp_page == data.login_page)
					data.hasLogin = true;
			}
		}
	}

	if(data.top.menu) {
	    if(data.top.menu.options && data.top.menu.options.widget_parameters) {
		var configOptions = JSON.parse(data.top.menu.options.widget_parameters);
		data.hideSearchOnHomepage = configOptions.exclude_search_on_homepage.value;
		data.showRequests = configOptions.enable_requests.value;
		data.showTodos = configOptions.enable_tasks.value;
	    } else {
		data.hideSearchOnHomepage = false;
		data.showRequests = false;
		data.showTodos = false;
	    }
	    if(data.top.menu.data) {
		data.top.menu.data.menu.items = [];
	    }
	}

	if (data.hideSearchOnHomepage) {
		data.homepage = $sp.getValue('homepage');
		var gr = new GlideRecord('sp_page');
		gr.get(data.homepage);
		data.dashboardSuffix = gr.getValue("id");
		data.portalSuffix = $sp.getPortalRecord().getDisplayValue("url_suffix");
	}

	// Analytics
	data.analyticsSupportEnabled = new GlidePluginManager().isActive('com.sn_content_analytics') && new GlidePluginManager().isActive('com.sn_content_delivery') && !sn_cd.cd_ContentDelivery.isContentPreview($sp);

	//Clean up items that don't belong
	if (data.sub.menu && data.sub.menu.data) {
	    data.sub.menu.data.cartWidget = {};
	    data.sub.menu.data.showTours = false;
	}
	if (data.sub.menu && data.sub.menu.options) {
	    data.sub.menu.options.enable_cart = false;		
	}

	data.loginWidget = $sp.getWidgetFromInstance('login-modal');
	var typeAheadOptions = {};
	typeAheadOptions.refresh_page_on_search_submission = false;
	typeAheadOptions.title = gs.getMessage("Search the portal");
	if($sp.isAISearchEnabled())
		typeAheadOptions.disable_all_suggestions = ($sp.getParameter('disableAllSuggestions') == 'true');
	data.typeahead = $sp.getWidget('typeahead-search', typeAheadOptions);
	data.avatarDropDown = $sp.getWidget('profile-with-drop-down',{"profile_url": data.link, "show_xs_avatar": false});

})();
