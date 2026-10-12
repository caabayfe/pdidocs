(function() {
    var stats = {};
    stats.callerId = 'd0009941eb103010ed7966d6475228c1';
    stats.callerTable = 'sp_widget';
    stats.refTable = stats.callerTable;
    stats.refRecordId = stats.callerId;
    stats.textPrefix = 'Employee Center Header';
    stats.userId = gs.getUserID();
    stats.startTime = new GlideDateTime();
    stats.guid = gs.generateGUID();

    var nestedStats = {};
    nestedStats.callerId = 'd0009941eb103010ed7966d6475228c1';
    nestedStats.callerTable = 'sp_widget';
    nestedStats.parentId = stats.guid;
    nestedStats.textPrefix = 'EC Header';
    nestedStats.userId = gs.getUserID();

    var useLightWeightMode = false;
    var pageId = $sp.getParameter('id');
    var articleId = $sp.getParameter('sys_id');
    var isContentDeliveryActive = new GlidePluginManager().isActive('com.sn_content_delivery');
    var performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();

    // Check if the current server node is under heavy load and store the status in session storage
    var isNodeSaturated = new sn_ex_emp_fd.PortalPerformanceUtil().isNodeUnderHeavyLoad();
    gs.getSession().putClientData('node_health_status', isNodeSaturated);
	  
    var portalNavRecord = null;
    var navInput = {};
    data.portal = $sp.getPortalRecord();
    data.portalId = data.portal.getUniqueValue();
    var portalNavRecordId;
    var activePortalNavRecord;

    var portalNavUtil = new sn_ex_sp.PortalExtensibleNavigationUtil();
    portalNavRecord = portalNavUtil.getActivePortalNavRecord(data.portalId);
    data.navStyle = portalNavRecord ? portalNavRecord.getValue('navigation_style') : 'top';

    // Check plugin and page requirements
    if (isContentDeliveryActive) {
        nestedStats.startTime = new GlideDateTime();
        var showHighTrafficEventModal = gs.getProperty(sn_cd.cd_CommonConstants.HIGH_TRAFFIC_EVENT_MODAL, 'false') === 'true';
        // Check Content Publishing is updated enough to have company event scripts
        try {
          var companyEventCacheManager = new sn_cd.cd_CompanyEventCacheManager();
          var companyEvents = new sn_cd.cd_CompanyEvents();
        } catch (e) {}

        if (showHighTrafficEventModal && companyEvents && companyEventCacheManager && typeof companyEventCacheManager.getCurrSurgeEvents !== "undefined") {
          data.currSurgeEventsCache = companyEventCacheManager.getCurrSurgeEvents();
          data.userAuthorizedEvents = companyEvents.getUserAuthorizedEvents();
        }
        data.companyEventPageId = gs.getProperty(sn_cd.cd_CommonConstants.PORTAL_COMPANY_EVENT_PAGE_ID);

        if (pageId === data.companyEventPageId && articleId && companyEvents) {
            var surgeEventInfo = companyEvents.getSurgeEventInfo(articleId);
            if (surgeEventInfo) {
                portalNavRecordId = surgeEventInfo.portalNavId;
                useLightWeightMode = surgeEventInfo.isSurgeEvent;
            }
            if(useLightWeightMode) {
                var surgePortalNavRecord = new GlideRecord('sn_ex_sp_portal_extensible_navigation');
                if (surgePortalNavRecord.get(portalNavRecordId)) {
                    portalNavRecord = surgePortalNavRecord;
                }
            }
        }
        nestedStats.shortDesc = "CompanyEvents";
        performanceIndicatorUtil.postHotspot(nestedStats);
    }

    portalNavRecordId = portalNavRecord ? portalNavRecord.getUniqueValue() : null;
    activePortalNavRecord = !gs.nil(portalNavRecord);

    navInput.activePortalNavRecord = activePortalNavRecord;
    navInput.useLightWeightMode = useLightWeightMode;
    navInput.portalNavRecordId = portalNavRecordId;
    navInput.navStyle = data.navStyle
    gs.getSession().putClientData('nav_input', JSON.stringify(navInput));
    
    data.escNavigation = (data.navStyle == 'left') ? $sp.getWidget("employee-center-left-navigation") : $sp.getWidget("employee-center-navigation");
    
    function isImpersonating() {
        if (gs.getCurrentScopeName() == "rhino.global")
            return GlideImpersonate().isImpersonating();
        return gs.getSession().isImpersonating();
    }

    /**
     * Conditionaly looks for EXfeedbackUtil script include to support compatibility with older versions of store app
     */
    function getFeedbackUtil(portalId) {

        var feedbackUtilGr = new GlideRecord('sys_script_include');
        feedbackUtilGr.addQuery('sys_id', '2d6125cf777331105e82756f1b5a9965');
        feedbackUtilGr.query();
        if (feedbackUtilGr.hasNext())
            return new sn_ex_sp_pro.ExFeedbackPortalUtil(portalId);

        feedbackUtilGr = new GlideRecord('sys_script_include');
        feedbackUtilGr.addQuery('sys_id', '67ad9f6aeb313110f3da2ff2a252288e');
        feedbackUtilGr.query();
        if (feedbackUtilGr.hasNext())
            return new sn_ex_sp_pro.ExFeedbackUtil(portalId);
    }

    var isPerfWidgetEnabled = (isImpersonating() || gs.hasRole('sp_admin')) && gs.getProperty("sn_ex_sp_perf_tools.enable_perf_widget", 'true') == 'true';
    if (isPerfWidgetEnabled)
        data.perfWidget = $sp.getWidget('performance_indicator');

    // hasAssignedRole API is only available X+
    try {
        data.showSimpleHeader = gs.getUser().hasAssignedRole('sn_jny.pre_hire');
    } catch (e) {
        data.showSimpleHeader = false;
    }
    data.ACTION_TODO_COUNT = 'update_todo_count';
    data.ACTION_LOAD_CASES = 'load_cases';
    data.isMobile = gs.isMobile();
    data.isFavoritesEnabled = useLightWeightMode ? false : $sp.getValue('enable_favorites') == 'true';
    data.isPersonalizedAnswer = GlidePluginManager().isActive("com.sn_app_ex_integrated_answers");

    //Initialize menu objects
    data.sub = {};
    data.top = {};
    var menu = !useLightWeightMode ? $sp.getValue("sp_rectangle_menu") : '';
    data.sub.menu = menu ? $sp.getWidgetFromInstance(menu) : '';

    //Copy sub menu to top menu, we want cart up top and menu items in the sub nav
    data.top.menu = JSON.parse(JSON.stringify(data.sub.menu));

    var configOptions = JSON.parse((data.top.menu && data.top.menu.options && data.top.menu.options.widget_parameters) || '{}');

    data.moreItemsSysId = (configOptions.enable_more_items && configOptions.enable_more_items.sysId) || '';
    data.hideSearchOnHomepage = configOptions.exclude_search_on_homepage ? configOptions.exclude_search_on_homepage.value : false;
    data.showRequests = useLightWeightMode ? false : (configOptions.enable_requests ? configOptions.enable_requests.value : true);
    data.showTodos = useLightWeightMode ? false : (configOptions.enable_tasks ? configOptions.enable_tasks.value : true);
    data.showAssets = useLightWeightMode ? false : ((configOptions.enable_assets ? configOptions.enable_assets.value : false) && (GlidePluginManager.isActive('com.sn_itam_common') && sn_itam_common.AssetWidgetUtils && sn_itam_common.AssetWidgetUtils.showMyAssetsOnWidgetType(gs.getUserID(), 'hardware')));

    if (data.showAssets) {
        nestedStats.startTime = new GlideDateTime();
        data.assetAttestaionCount = sn_itam_common.AssetWidgetUtils.assetsWithUserAttesationNeeded(gs.getUserID());
        data.assetReceiveCount = sn_itam_common.AssetWidgetUtils.assetsToBeReceivedOnWidgetType ? sn_itam_common.AssetWidgetUtils.assetsToBeReceivedOnWidgetType(gs.getUserID(), "hardware") : 0;
        if (data.assetAttestaionCount && data.assetReceiveCount) {
            data.totalAssetActionLabel = gs.getMessage("{0} assets need attestation and {1} assets need to be received");
        } else if (data.assetAttestaionCount) {
            data.totalAssetActionLabel = gs.getMessage("{0} assets need attestation");
        } else if (data.assetReceiveCount) {
            data.totalAssetActionLabel = gs.getMessage("{0} assets need to be received");
        }
        nestedStats.shortDesc = "showAssets";
        performanceIndicatorUtil.postHotspot(nestedStats);
    } else {
        data.assetAttestaionCount = 0;
        data.assetReceiveCount = 0;
        data.totalAssetActionLabel = '';
    }
    data.totalAssetActionCount = data.assetAttestaionCount + data.assetReceiveCount;
    data.todoCount = 0;
    data.todoCountLabel = '';

    //Load To-dos count
    if ((!input || input.action == data.ACTION_TODO_COUNT) && data.showTodos) {
        nestedStats.startTime = new GlideDateTime();
        var myTodosCountObject = new sn_hr_sp.todoPageUtils().getMyTodosCount(false, false, true);
		
        // Cache computed todo count on page load.
        if (!input) {
            gs.getSession().putClientData('todo_count', myTodosCountObject.todoCount);
        }

        data.mobileViewTodoCount = myTodosCountObject.todoCount;
        data.todoCount = (myTodosCountObject.todoCount > 9) ? '9+' : myTodosCountObject.todoCount;

        data.todoCountLabel = gs.getMessage("{0} to-dos remaining");
        data.recordWatchers = myTodosCountObject.recordWatchers;

        nestedStats.shortDesc = "getMyTodosCount";
        performanceIndicatorUtil.postHotspot(nestedStats);

        // avoid consecutive calls
        if (input)
            return;
    }

    data.isHrCoreActive = GlidePluginManager().isActive("com.sn_hr_core");
    if (data.isHrCoreActive && gs.getProperty('sn_hr_core.esc.create_hrprofile.override', 'true') === "true") {
        nestedStats.startTime = new GlideDateTime();
        // HR Profile
        var hrProfileGr = new GlideRecord('sn_hr_core_profile');
        hrProfileGr.addQuery('user', gs.getUserID());
        hrProfileGr.setLimit(1);
        hrProfileGr.query();
        if (!hrProfileGr.hasNext() && gs.getUserID() && new GlideRecord('sys_user').get(gs.getUserID())) {
            hrProfileGr.setValue('user', gs.getUserID());
            hrProfileGr.insert();
        }
        nestedStats.shortDesc = "create hrprofile override";
        performanceIndicatorUtil.postHotspot(nestedStats);
    }

    // check for listening posts voluntary feedback
    data.voluntarySurveyIsActive = false;
    data.isListeningPostsActive = GlidePluginManager().isActive("sn_lp");
    if (!useLightWeightMode && data.isListeningPostsActive) {
        nestedStats.startTime = new GlideDateTime();
        var pulseUtils = new sn_lp.PulseUserCriteriaEvaluation();
        data.voluntarySurvey = pulseUtils.getActiveVoluntarySurvey && pulseUtils.getActiveVoluntarySurvey();

        if (data.voluntarySurvey && data.voluntarySurvey.next()) {
            data.voluntarySurveyIsActive = true;
        }
        nestedStats.shortDesc = "getActiveVoluntarySurvey";
        performanceIndicatorUtil.postHotspot(nestedStats);
    }

    function checkDrawerV2Availability() {
        var ga = new GlideAggregate('sp_widget');
        ga.addQuery("sys_id", "0ed0a9f34302c210d06729f026b8f272");
        ga.addAggregate('COUNT');
        ga.query();
        var count = 0;
        if (ga.next()) {
            count = ga.getAggregate('COUNT');
        }
        return count > 0;
    }

    // check for experience feedback
    function experienceFeedbackCheck() {
        data.exFeedbackActive = false;
        data.isDrawerConfigured = false;
        var portalId = $sp.getPortalRecord().sys_id;
        var isECProActive = GlidePluginManager().isActive("sn_ex_sp_pro");
        var pageId = $sp.getParameter("id");

        if (!pageId)
            pageId = $sp.getDisplayValue('homepage').toString();

        data.drawerV2Available = checkDrawerV2Availability();
        var feedbackUtil = getFeedbackUtil(portalId);

        if (isECProActive) {
            if (data.drawerV2Available && feedbackUtil.shouldRefreshDefnOnNavigation()) {
                data.shouldRefreshDefnOnNavigation = true
                data.isDrawerConfigured = true;
                data.drawerV2Available = true;
                var widgetInput = {
                    navStyle : data.navStyle
                }
                data.modalWidget = $sp.getWidget('experience-feedback-wrapper',widgetInput);
                data.headerFeedbackWidget = $sp.getWidget('experience-feedback-header-wrapper');

            } else {
                data.shouldRefreshDefnOnNavigation = false;
                data.exFeedbackActive = false;
                if (feedbackUtil) {
                    var feedbackConfig = feedbackUtil.getFeedbackConfig(portalId);
                    var feedbackDefinitionGr = feedbackUtil.getFeedbackDefinitionForDrawer(pageId);
                    if (feedbackConfig && feedbackDefinitionGr) {
                        data.isDrawerConfigured = true;
                        data.widgetData = feedbackUtil.getDrawerWidgetData(feedbackConfig, feedbackDefinitionGr);
                        data.widgetData.navStyle = data.navStyle;
                        data.modalWidget = $sp.getWidget('experience-feedback-drawer', data.widgetData);
                        data.headerFeedbackWidget = $sp.getWidget('experience-feedback-header-item', data.widgetData);
                    }
                    data.homepageDisplayValue = $sp.getDisplayValue('homepage').toString();
                }
            }
        }
    }
    if (!useLightWeightMode) {
        nestedStats.startTime = new GlideDateTime();
        experienceFeedbackCheck();
        nestedStats.shortDesc = "experienceFeedbackCheck";
        performanceIndicatorUtil.postHotspot(nestedStats);
    }

    // populate the 'data' object
    data.link = '?id=hri_user_profile&sys_id=' + gs.getUserID();

    // Defines the support queue ID that will be linked to by the Live Chat link in header
    data.login_page = $sp.getValue('login_page');

    //Fetching My Items menu item sys_id
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

    if (moreItems && moreItems.items) {
        data.moreItems = moreItems.items;
    } else if (moreItems && moreItems.scriptedItems && moreItems.scriptedItems.items) {
        data.moreItems = moreItems.scriptedItems.items;
    }

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

    if (data.hideSearchOnHomepage) {
        data.homepage = $sp.getValue('homepage');
        var gr = new GlideRecord('sp_page');
        gr.get(data.homepage);
        data.dashboardSuffix = gr.getValue("id");
        data.portalSuffix = $sp.getPortalRecord().getDisplayValue("url_suffix");
    }

    data.showMoreItems = (moreItems && moreItems.label && data.moreItems && configOptions.enable_more_items) ? (data.moreItems.length > 0 && configOptions.enable_more_items.value) : false;
    if (data.showMoreItems)
        data.moreItemsTitle = data.moreItems.length === 1 ? data.moreItems[0].shortLabel : moreItems.label;

    // Analytics
    data.analyticsSupportEnabled = new GlidePluginManager().isActive('com.sn_content_analytics') && new GlidePluginManager().isActive('com.sn_content_delivery') && !sn_cd.cd_ContentDelivery.isContentPreview($sp);

    //Clean up items that don't belong
    if (subMenu) {
        if (subMenu.data) {
            subMenu.data.cartWidget = {};
            subMenu.data.showTours = false;
        }
        if (subMenu.options) {
            subMenu.options.enable_cart = false;
        }
    }
    if (data.top.menu && data.top.menu.data && data.top.menu.data.menu && data.top.menu.data.menu.items)
        data.top.menu.data.menu.items = [];

    if (!useLightWeightMode) {
        var typeAheadOptions = {};
        typeAheadOptions.refresh_page_on_search_submission = false;
        typeAheadOptions.title = gs.getMessage("Search");
        if ($sp.isAISearchEnabled())
            typeAheadOptions.disable_all_suggestions = ($sp.getParameter('disableAllSuggestions') == 'true');
        data.typeahead = $sp.getWidget('typeahead-search', typeAheadOptions);
    }
    data.loginWidget = $sp.getWidgetFromInstance('login-modal');
    data.avatarDropDown = $sp.getWidget('profile-with-drop-down', {
        "profile_url": data.link,
        "show_xs_avatar": false
    });

    //Portal Notifications widget
    data.isNotificationsActive = GlidePluginManager().isActive("sn_ex_sp_notifs");
    if (!useLightWeightMode && data.isNotificationsActive) {
        nestedStats.startTime = new GlideDateTime();
        data.notificationsBellWidget = $sp.getWidget('ec-notifications-bell');
        nestedStats.shortDesc = "Portal Notifications widget";
        performanceIndicatorUtil.postHotspot(nestedStats);
    }

    function safeGet(objectParam, pathParam, defaultValue) {
        var path = Array.isArray(pathParam) ? pathParam : pathParam.split('.');
        var index = 0;
        var length = path.length;
        var objectVal = objectParam;

        while (objectVal != null && index < length) {
            objectVal = objectVal[path[index]];
            index++;
        }
        var value = index === length ? objectVal : undefined;
        return !gs.nil(value) ? value : defaultValue;
    }

    try {
        data.showSparkle = $sp.isNowAssistEnabled();
    } catch (error) {
        data.showSparkle = false;
    }
    if (!useLightWeightMode && data.showSparkle)
        data.sparkle = $sp.getWidget('now_assist_sparkle_icon');
    stats.shortDesc = 'Load Data';
    performanceIndicatorUtil.postHotspot(stats);
})();
