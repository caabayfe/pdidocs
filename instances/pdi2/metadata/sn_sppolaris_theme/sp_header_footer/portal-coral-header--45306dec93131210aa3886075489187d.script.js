(function() {
    data.isMobile = gs.isMobile();
    data.instanceId = $sp.getDisplayValue("sys_id");

    data.login_page = $sp.getValue('login_page');

    data.langSelector = GlidePluginManager.isActive('com.glide.i18n') ? $sp.getWidget('sp-lang-selector') : "";
    
	data.showSubHeader = true;
  var portalRecord = $sp.getPortalRecord();
  var urlSuffix=portalRecord.getValue("url_suffix");
	// Load the Secondary Menu Widget

    var qsConfig = $sp.getValue("quick_start_config");
    var qsConfigJson = qsConfig ? JSON.parse(qsConfig)[0] : {};
    if(qsConfigJson.headerSearch && qsConfigJson.headerSearch.display_search === true){
      data.excludeSeachForPages = [];
      if (qsConfigJson.headerSearch.exclude_search_for_pages)
            data.excludeSeachForPages = qsConfigJson.headerSearch.exclude_search_for_pages.split(",");
      data.aisEnabled = $sp.isAISearchEnabled();
      if (data.aisEnabled) {
          var typeAheadOptions = {
              search_application: portalRecord.getValue('search_application'),
              disable_all_suggestions: false
          };
          if (qsConfigJson.headerSearch.search_placeholder_text)
              typeAheadOptions.placeholder = gs.getMessage(qsConfigJson.headerSearch.search_placeholder_text);
      }
      else {
          var typeAheadOptions = {
              size: 'md',
              color: 'default'
          };
          if (qsConfigJson.headerSearch.search_placeholder_text)
              typeAheadOptions.title = gs.getMessage(qsConfigJson.headerSearch.search_placeholder_text);
      }
      data.typeAheadSearch = $sp.getWidget('typeahead-search', typeAheadOptions);
	  }
	  if(qsConfigJson.widget){
		data.embeddedWidget = $sp.getWidget(qsConfigJson.widget.widget_id, qsConfigJson.widget.instance_options || {});
	  }
	  data.showTypeAheadSearch = (data.typeAheadSearch && data.typeAheadSearch.sys_id ? true : false) && qsConfigJson.headerSearch && qsConfigJson.headerSearch.display_search === true;
	

    var showSubHeaderString = qsConfigJson.showSubHeader;
    if (!gs.nil(showSubHeaderString))
        switch (showSubHeaderString.toUpperCase()) {
            case "ON_LOG_IN":
                data.showSubHeader = gs.isLoggedIn();
                break;
            case "NEVER":
                data.showSubHeader = false;
                break;
            case "ALWAYS":
            default:
                data.showSubHeader = true;
                break;
        }

    //Initialize menu objects
    data.sub = {};
    data.top = {};

    var menu = $sp.getValue("sp_rectangle_menu");

    if (!gs.nil(menu)) {

        data.sub.menu = $sp.getWidgetFromInstance(menu);

        //Copy sub menu to top menu, we want cart up top and menu items in the sub nav
        data.top.menu = JSON.parse(JSON.stringify(data.sub.menu));

        //Fetching My Items menu item sys_id
        var configOptions = JSON.parse((data.top.menu && data.top.menu.options && data.top.menu.options.widget_parameters) || '{}');
        data.moreItemsSysId = (configOptions.enable_more_items && configOptions.enable_more_items.sysId) || '';

        var subMenu = data.sub.menu;
        var moreItems;
        if (subMenu && subMenu.data) {
            subMenu.data.replace = true;
            // Hide login if menu already has link to login
            data.hasLogin = false;
            var subMenuDataItems = (subMenu.data.menu && subMenu.data.menu.items) || [];
            for (var i in subMenuDataItems) {

                var item = subMenuDataItems[i];
                if (item.sys_id === data.moreItemsSysId)
                    moreItems = item;
                if (item.type === 'page' && item.sp_page === data.login_page)
                    data.hasLogin = true;
            }
        }

        if (moreItems && moreItems.items)
            data.moreItems = moreItems.items;
        if (moreItems && data.moreItems && moreItems.label) {
            // Removing items with no label
            data.moreItems = data.moreItems.filter(function(moreItem) {
                return moreItem.label;
            });

            // Truncating label of items exceeding 60 character limit
            data.moreItems.forEach(function(moreItem) {
                moreItem.shortLabel = (moreItem.label.length > 60) ? (moreItem.label.substring(0, 60) + '...') : moreItem.label;
            });
        }
    
    data.showMoreItems = (moreItems && moreItems.label && data.moreItems && configOptions.enable_more_items) ? (data.moreItems.length > 0 && configOptions.enable_more_items.value) : false;
    if (data.showMoreItems)
        data.moreItemsTitle = data.moreItems.length === 1 ? data.moreItems[0].shortLabel : moreItems.label;
		
		
	//Clean up items that don't belong
    subMenu.data.cartWidget = {};
    subMenu.options.enable_cart = false;
    subMenu.options.enable_wishlist = false;
    subMenu.data.showTours = false;
    subMenu.data.menuType = 'SUB';

    // Make this true to show Tours menu in main header
    var portal_sys_id = $sp.getValue("sys_id");
    if (portal_sys_id == "4ab20f2877064110d3ef07dc7d5a99a7" || portal_sys_id== "41082b347710011034422a22fe5a9963" || portal_sys_id=="9301b3a9bdd73010f8772b09d7aaaf2e") {
		data.top.menu.data.showTours = false;
	  }
    else {
		data.top.menu.data.showTours = true;
	}
    data.top.menu.data.hasLogin = data.hasLogin;
    data.top.menu.data.menuType = 'TOP';

    if(data.top.menu.sys_id === '756957db43f5ed1011a4ebdffab8f243'){
			if (data.top.menu && data.top.menu.data && data.top.menu.data.menu && data.top.menu.data.menu.items){
				data.sub.menu.data.menu.items = data.sub.menu.data.menu.items.filter(function(item) {
						return item.type != 'scripted';
				});
				data.top.menu.data.menu.items = data.top.menu.data.menu.items.filter(function(item) {
						return item.type == 'scripted';
				});
			}
		}	
		else {
			 if (data.top.menu && data.top.menu.data && data.top.menu.data.menu && data.top.menu.data.menu.items)
        data.top.menu.data.menu.items = [];
		}
	}
    // Analytics
    data.analyticsSupportEnabled = new GlidePluginManager().isActive('com.sn_content_analytics') && new GlidePluginManager().isActive('com.sn_content_delivery') && !sn_cd.cd_ContentDelivery.isContentPreview($sp);
    data.supportProfilePortal = new sn_sppolaris_theme.UserProfileUtil().getProfileURL(urlSuffix);
    data.loginWidget = $sp.getWidgetFromInstance('login-modal');
	data.initialPageId = $sp.getParameter('id');
	if (!data.initialPageId)
		data.initialPageId = '';
})();
