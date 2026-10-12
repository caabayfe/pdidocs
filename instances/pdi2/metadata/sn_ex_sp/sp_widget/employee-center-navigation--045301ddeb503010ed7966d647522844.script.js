(function() {
    var stats = {};
    stats.callerId = '045301ddeb503010ed7966d647522844';
    stats.callerTable = 'sp_widget';
    stats.refTable = stats.callerTable;
    stats.refRecordId = stats.callerId;
    stats.textPrefix = 'Employee Center Navigation';
    stats.userId = gs.getUserID();
    stats.startTime = new GlideDateTime();
    
    var session = gs.getSession();
    var userLanguage = session.getLanguage();
    var taxonomyId = null;
    var nonTopicMenuItems = [];	
    var useLightWeightMode = false;
    
    data.async_load = (gs.getProperty('sn_ex_sp.megamenu_async_load') === 'true');
    if(data.async_load){
      data.async_timeout = gs.getProperty('sn_ex_sp.megamenu_async_timeout');
      data.skeletonView = (gs.getProperty('sn_ex_sp.megamenu_async_load_skeleton_view') === 'true');
      data.fetchTopicDataFromFlow = false;
      if(input){
        if(input.cancelFlow && input.executionId){
          cancelAsyncFlow(input.executionId)
          return;
        } else if(input.updateTopicDataFromFlow){
            session.putClientData('taxonomy_topic_menu_items', '');
        }
      }
    }
    
    data.portal = $sp.getPortalRecord();
    data.portalId = data.portal.getUniqueValue();
    data.userID = gs.getUserID();
    data.userName = gs.getUserName();
    data.isMobile = gs.isMobile();
    data.portalSuffix = data.portal.getDisplayValue("url_suffix");

    var topicsData = {
        rootTopics: [],
        topicToSubTopicsMap: {},
        rootTopicToQuickLinkMap: {}
    };
    var megaMenuDataMap = {};
    var portalNavRecord = null;
    var pageId = $sp.getParameter('id');
    var articleId = $sp.getParameter('sys_id');
    var performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();
    var portalNavUtil = new sn_ex_sp.PortalExtensibleNavigationUtil();
    data.sessionID = portalNavUtil.getSessionId();

    // Get navigation data from session
    var navInputStr = session.getClientData('nav_input');
    var navInput = {};
    var portalNavRecordId;
    
    if (navInputStr && navInputStr.length > 0) {
        navInput = JSON.parse(navInputStr);
        useLightWeightMode = navInput.useLightWeightMode;
        portalNavRecordId = navInput.portalNavRecordId;
        data.activePortalNavRecord = navInput.activePortalNavRecord;
    }

    if (!useLightWeightMode) {
      taxonomyId = String($sp.getTaxonomies());
      if(taxonomyId){
        var menuItems;
        var megaMenuTopics = [];
        var topicMenuItems = session.getClientData('taxonomy_topic_menu_items');
        if(topicMenuItems && topicMenuItems.length)
          menuItems = JSON.parse(topicMenuItems);
        if (menuItems && taxonomyId === menuItems.taxonomyId && menuItems.userID === data.userID && menuItems.language === userLanguage) {
          megaMenuTopics = menuItems.topicMenuItems;
        } else {
          if (data.async_load){
            if(!input) {
              var inputs = {};
              inputs['portalid'] = data.portalId;
              inputs['taxonomyid'] = taxonomyId;
              inputs['hidetopicswithnocontent'] = true;
              inputs['maxlevel'] = 2;
              inputs['ismobile'] = false;
              inputs['skeletonview'] = data.skeletonView;

              data.flowInputs = inputs;
              data.fetchTopicDataFromFlow = true;
              if(data.skeletonView){
                return;
              } else {
                data.portalDataMapFilter = "data_type=Topics" + "^portal=" + data.portalId + "^user=" + data.userID;
                var topicsDataFromMap = getTopicsDataFromPortalMap(data.portalDataMapFilter);
                megaMenuTopics = topicsDataFromMap? JSON.parse(topicsDataFromMap):[];
              }
            } else if(input && input.updateTopicDataFromFlow){
              megaMenuTopics = JSON.parse(input.topicDataFromFlow);
            }
          } else {
            var portalTaxonomy = new sn_taxonomy.Taxonomy(taxonomyId);
            megaMenuTopics = portalTaxonomy.getTopics(true, 2, false);
          }
        
          var stringifiedTopicMenuItems = JSON.stringify({
            userID: data.userID,
            topicMenuItems: megaMenuTopics,
            taxonomyId: taxonomyId,
            language: userLanguage
          });
          session.putClientData('taxonomy_topic_menu_items', stringifiedTopicMenuItems);

          var topicSecurity = new sn_ex_sp.TopicSecurityUtil();
          var knowledgeBases = topicSecurity.fetchKnowledgeBaseFromSession();
        }
        if (!data.activePortalNavRecord) {
          var quickLinkMappedTopicItems = session.getClientData('taxonomy_quick_link_topic_items');
          var quickLinkTopics = JSON.parse(quickLinkMappedTopicItems);
          if (quickLinkTopics && taxonomyId === quickLinkTopics.taxonomyId && quickLinkTopics.userID === data.userID && quickLinkTopics.language === userLanguage) {
            topicsData = quickLinkTopics.quickLinkTopicItems;
          } else {
            topicsData = parseTopics(megaMenuTopics);
            var stringifiedQuickLinkTopicItems = JSON.stringify({
              userID: data.userID,
              quickLinkTopicItems: topicsData,
              taxonomyId: taxonomyId,
              language: userLanguage
            });
            session.putClientData('taxonomy_quick_link_topic_items', stringifiedQuickLinkTopicItems);
          } 
        } else {
            megaMenuTopics.forEach(function(topic) {
                megaMenuDataMap[topic.sys_id] = topic;
            });
        }
      }
      
      var spMainMenu = $sp.getWidgetFromInstance($sp.getValue('sp_rectangle_menu'));
      nonTopicMenuItems = spMainMenu.data && spMainMenu.data.menu ? spMainMenu.data.menu.items : [];
      var configOptions = {};
      if (spMainMenu.options && spMainMenu.options.widget_parameters) {
        configOptions = JSON.parse(spMainMenu.options.widget_parameters);
      }
      var moreItemsSysId = (configOptions.enable_more_items && configOptions.enable_more_items.sysId) || '';

      // Removing My Items from the sub header menu items list and restricting label size to 60 characters
      nonTopicMenuItems = nonTopicMenuItems.filter(function(nonTopicMenuItem) {
        nonTopicMenuItem.label = nonTopicMenuItem.label.substr(0, 60);
        return nonTopicMenuItem.sys_id !== moreItemsSysId;
      });
    }

    if (data.activePortalNavRecord) {
      data.leftAlignMenuItems = [];
      data.rightAlignMenuItems = [];
      var megaMenuData = {
        rootNavItems: [],
        parentToChildNavItemsMap: {},
        rootNavItemToQuickLinkMap: {}
      };
      var portalNavMenuItems;
      if (useLightWeightMode) {
        var menuItemsForSurgedEvent = new sn_ex_sp.CompanyEventsUtil().getLightWeightMenuItems(portalNavRecordId);
        portalNavMenuItems = menuItemsForSurgedEvent.portalNavMenuItems;
        nonTopicMenuItems = menuItemsForSurgedEvent.parsedNavMenuItems;
      } else {
        portalNavMenuItems = portalNavUtil.getActivePortalNavMenuItems(portalNavRecordId);
      }  
      nonTopicMenuItems.forEach(function(menuItem) {
        megaMenuDataMap[menuItem.sys_id] = menuItem;
        if (menuItem.items && menuItem.items.length > 0) {
          menuItem.items.forEach(function(childMenuItem) {
            megaMenuDataMap[childMenuItem.sys_id] = childMenuItem;
          });
        } else if (!gs.nil(menuItem.scriptedItems) && !gs.nil(menuItem.scriptedItems.items) && !useLightWeightMode) {
          menuItem.scriptedItems.items.forEach(function(scriptedItem) {
            if (scriptedItem.type == 'record') {
              // For filtered menu items , short_description has display 1 value.
              scriptedItem.label = scriptedItem.short_description.substring(0, 60);
              scriptedItem.href = "?id=" + scriptedItem.__page + "&table=" + scriptedItem.__table + "&sys_id=" + scriptedItem.sys_id;
            }
            megaMenuDataMap[scriptedItem.sys_id] = scriptedItem;
          });
        }
      });

      var portalNavMenuData = parseNavItems(portalNavMenuItems);
      data.menuItemToChildrenMap = portalNavMenuData.parentToChildNavItemsMap;
      data.menuItems = portalNavMenuData.rootNavItems;
      nonTopicMenuItems = data.menuItems;

      data.menuItems.forEach(function(rootNavItem) {
        if (rootNavItem.submenu_type == 'standard') {
          var quickListData = portalNavUtil.getQuickLinkListForNavItem(rootNavItem.portal_nav_item);
          if (quickListData.length)
            portalNavMenuData.rootNavItemToQuickLinkMap[rootNavItem.portal_nav_item] = quickListData;
        } else if (!useLightWeightMode) {
          var childItems = data.menuItemToChildrenMap[rootNavItem.portal_nav_item];
          if (childItems && childItems.length > 0) {
            childItems.forEach(function(childNavItem) {
              var quickListData = portalNavUtil.getQuickLinkListForNavItem(childNavItem.portal_nav_item);
              if (quickListData.length)
                portalNavMenuData.rootNavItemToQuickLinkMap[childNavItem.portal_nav_item] = quickListData;
            });
          }
        }

        if (rootNavItem.position == 'left') {
          data.leftAlignMenuItems.push(rootNavItem);
        } else {
          data.rightAlignMenuItems.push(rootNavItem);
        }
      });
      data.menuItemToQuickLinks = portalNavMenuData.rootNavItemToQuickLinkMap;
    } else {
      data.menuItemToChildrenMap = topicsData.topicToSubTopicsMap;
      data.menuItems = getExtensibleNavigationData(topicsData.rootTopics, nonTopicMenuItems);
      data.menuItemToQuickLinks = topicsData.rootTopicToQuickLinkMap;
      nonTopicMenuItems.forEach(function(nonTopicItem) {
        if (nonTopicItem.items && nonTopicItem.items.length) {
          data.menuItemToChildrenMap[nonTopicItem.sys_id] = nonTopicItem.items;
        } else if (!gs.nil(nonTopicItem.scriptedItems) && !gs.nil(nonTopicItem.scriptedItems.items) && nonTopicItem.scriptedItems.items.length > 0) {
          if (nonTopicItem.type == 'filtered') {
            nonTopicItem.scriptedItems.items.forEach(function(scriptedItem) {
              if (scriptedItem.type == 'record') {
                // For filtered menu items , short_description has display 1 value.
                scriptedItem.label = scriptedItem.short_description.substring(0, 60);
                scriptedItem.href = "?id=" + scriptedItem.__page + "&table=" + scriptedItem.__table + "&sys_id=" + scriptedItem.sys_id;
              }
            });
          }
          data.menuItemToChildrenMap[nonTopicItem.sys_id] = nonTopicItem.scriptedItems.items;
        }
      });
    }

    stats.shortDesc = 'Load Data';
    performanceIndicatorUtil.postHotspot(stats);

    if (input && input.action == 'openGuidedhelp' && input.guidedHelpId && !useLightWeightMode) {
      data.pageId = $sp.getParameter('id') ? $sp.getParameter('id') : data.portal.homepage.getDisplayValue();
      data.guidedHelpResponse = new sn_ex_sp.QuickLinkUtil().handleGuidedHelpClick(input.guidedHelpId, data.pageId, "quick_link_from_megamenu");
    }

    /*
          Sample input (megaMenuTopics): Array of topics as below
          [
          {
          "sys_id": "5a0d9826eb003010ed7966d6475228e0",
          "parent_topic": "",
          "name": "root topic 1",
          "active": true,
          "taxonomy": "5c1dd826eb003010ed7966d647522873",
          "order": ""
          },
          {
          "sys_id": "03449953eb403010ed7966d64752288a",
          "parent_topic": "5a0d9826eb003010ed7966d6475228e0",
          "name": "sub topic 1.1",
          "active": true,
          "taxonomy": "5c1dd826eb003010ed7966d647522873",
          "order": ""
          }
          ]
        Sample output (topicsData) for above input:
        {
          rootTopics: [
            {
              "sys_id": "5a0d9826eb003010ed7966d6475228e0",
              "parent_topic": "",
              "name": "root topic 1",
              "active": true,
              "taxonomy": "5c1dd826eb003010ed7966d647522873",
              "order": ""
            }
          ],
          topicToSubTopicsMap: {
            "5a0d9826eb003010ed7966d6475228e0":
              [
                {
                  "sys_id": "03449953eb403010ed7966d64752288a",
                  "parent_topic": "5a0d9826eb003010ed7966d6475228e0",
                  "name": "sub topic 1.1",
                  "active": true,
                  "taxonomy": "5c1dd826eb003010ed7966d647522873",
                  "order": ""
                }
              ]
          }
        }
      */
    function parseTopics(megaMenuTopics) {
      megaMenuTopics.forEach(function(topic) {
        if (!topic.active)
          return;

        if (!topic.parent_topic) {
          topicsData.rootTopics.push(topic);
          var quickLinksList = new sn_ex_sp.QuickLinkUtil().fetchQuicklinksForTopic(topic.sys_id);
          if (quickLinksList)
            topicsData.rootTopicToQuickLinkMap[topic.sys_id] = quickLinksList;
        } else {
          var isParentTopicAlreadyInMap = (topic.parent_topic in topicsData.topicToSubTopicsMap);
          topicsData.topicToSubTopicsMap[topic.parent_topic] = isParentTopicAlreadyInMap ? topicsData.topicToSubTopicsMap[topic.parent_topic].concat(topic) : [topic];
        }
      });
      return topicsData;
    }

    function parseNavItems(portalNavMenuItems) {
      portalNavMenuItems.forEach(function(navItem) {
        if (gs.nil(megaMenuDataMap[navItem.sys_id]))
          return;
        var menuItem = navItem;
        if (!navItem.parent_nav_item) {
          if (navItem.type == 'menu') {
            menuItem = updateMenuItemRecord(navItem);
            if (!gs.nil(menuItem.scriptedItems) && !gs.nil(menuItem.scriptedItems.items) && menuItem.scriptedItems.items.length > 0) {
              megaMenuData.parentToChildNavItemsMap[navItem.portal_nav_item] = menuItem.scriptedItems.items;
            }
          }
          megaMenuData.rootNavItems.push(JSON.parse(JSON.stringify(menuItem)));
        } else {
          var isParentNavItemAlreadyInMap = (navItem.parent_nav_item in megaMenuData.parentToChildNavItemsMap);
          if (navItem.type == 'topic') {
            megaMenuData.parentToChildNavItemsMap[navItem.parent_nav_item] = isParentNavItemAlreadyInMap ? megaMenuData.parentToChildNavItemsMap[navItem.parent_nav_item].concat(navItem) : [navItem];
          } else {
            menuItem = updateMenuItemRecord(navItem);
            megaMenuData.parentToChildNavItemsMap[navItem.parent_nav_item] = isParentNavItemAlreadyInMap ? megaMenuData.parentToChildNavItemsMap[navItem.parent_nav_item].concat(JSON.parse(JSON.stringify(menuItem))) : [JSON.parse(JSON.stringify(menuItem))];
          }
        }
      });
      return megaMenuData;
    }

    function updateMenuItemRecord(navItem) {
      var menuItem = megaMenuDataMap[navItem.sys_id];
      menuItem.browse_button = navItem.browse_button;
      menuItem.browse_button_text = navItem.browse_button_text;
      menuItem.order = navItem.order;
      menuItem.position = navItem.position;
      menuItem.render_as = navItem.render_as;
      menuItem.submenu_type = navItem.submenu_type;
      menuItem.portal_nav_item = navItem.portal_nav_item;
      menuItem.parent_nav_item = navItem.parent_nav_item;
      menuItem.items = navItem.items;
      if (menuItem.render_as == 'modal_window') {
        menuItem.widget = navItem.widget;
        menuItem.widget_parameters = navItem.widget_parameters;
      }
      return menuItem;
    }

    function getExtensibleNavigationData(rootTopics, nonTopicMenuItems) {
      var extensibleNavigationData = [];
      var extensibleNavigationItems = portalNavUtil.getExtensibleNavigationItems(data.portalId);
      if (extensibleNavigationItems && extensibleNavigationItems.length > 0) {
        for (item in extensibleNavigationItems) {
          if (extensibleNavigationItems[item].type == 'menu') {
            for (menu in nonTopicMenuItems) {
              if (nonTopicMenuItems[menu].sys_id == extensibleNavigationItems[item].sysId) {
                extensibleNavigationData.push(nonTopicMenuItems[menu]);
                break;
              }
            }
          } else {
            for (topic in rootTopics) {
              if (rootTopics[topic].sys_id == extensibleNavigationItems[item].sysId) {
                extensibleNavigationData.push(rootTopics[topic]);
                break;
              }
            }
          }

        }
      } else {
        extensibleNavigationData = rootTopics.concat(nonTopicMenuItems);
      }
      return extensibleNavigationData;
    }
    
    function cancelAsyncFlow(executionId) {
      var contextGR = new GlideRecord('sys_flow_context');
      contextGR.addQuery('execution_id', input.executionId);
      contextGR.query();
      if (contextGR.next()) {
        var contextId = contextGR.getUniqueValue(); // This is the sys_id of the flow context
        sn_fd.FlowAPI.cancel(contextId, 'Flow cancelled due to timeout');
      } 
      return;
    }
	    
    function getTopicsDataFromPortalMap (portalDataMapFilter) {
      var portalDataMapGr = new GlideRecord('sn_ex_sp_user_portal_data_map');
      portalDataMapGr.addEncodedQuery(portalDataMapFilter);
      portalDataMapGr.query();
      return portalDataMapGr.next() ? portalDataMapGr.getValue('value') : '';
    }
	})();
