var PortalExtensibleNavigationUtilSNC = Class.create();
PortalExtensibleNavigationUtilSNC.prototype = {
    initialize: function() {
        this.EMPLOYEE_CENTER_CACHE = 'employee_center_cache';
    },
    /**
     * Fetch all the spMenuitems until 2 levels and stores sysids in an array
     * @input: portal - sys_id of portal, parentSysId - tells about the parent spMenuitem, levels - depth , spMenuSysIds - contains spMenuitem sysids.
     **/
    _fetchMenusForLookup: function(portal, parentSysId, levels, spMenuSysIds) {
        if (levels <= 0) {
            return;
        }
        var menuGr = new GlideRecord('sp_rectangle_menu_item');
        menuGr.addActiveQuery();
        if (parentSysId) {
            menuGr.addEncodedQuery("sp_rectangle_menu_item=" + parentSysId + "^typeNOT INfiltered,scripted");
        } else {
            menuGr.addEncodedQuery("sp_rectangle_menu=" + this._getSpMenuForPortal(portal) + "^sys_id!=01ef85b65368301056c1ddeeff7b12ce");
        }
        menuGr.query();
        while (menuGr.next()) {
            if (menuGr.label)
                spMenuSysIds.push(menuGr.getUniqueValue());
            this._fetchMenusForLookup(portal, menuGr.getUniqueValue(), levels - 1, spMenuSysIds);
        }
    },

    /**
     * Removes the duplicates to avoid showing duplicate records in the lookup
     * @input: parentIds and childIds - arrays containing the sysids.
     * @output: return parentsIds
     **/
    _removeDuplicateLookups: function(parentIds, childIds) {
        childIds.forEach(function(id) {
            var index = parentIds.indexOf(id);
            if (index > -1) {
                parentIds.splice(index, 1);
            }
        });
        return parentIds;
    },
    /**
     * Fetch spMenuitems present in the given hierarchy(root to given spMenuitem)
     * @input: menuItemGr - glideRecord of sn_ex_sp_portal_extensible_navigation_item, menuItems - contains spMenuItem sysids.
     **/
    _getSpMenusFromHierarchy: function(menuItemGr, menuItems) {
        while (menuItemGr) {
            if (menuItemGr.navigation_item_type == 'menu') {
                menuItems.push(menuItemGr.menu.toString());
            }
            menuItemGr = menuItemGr.parent_item;
        }
    },

    _getFilteredORScriptedMenus: function(portal, menuItems) {
        var menuGr = new GlideRecord('sp_rectangle_menu_item');
        menuGr.addEncodedQuery('sp_rectangle_menu=' + this._getSpMenuForPortal(portal) + '^sp_rectangle_menu_itemISEMPTY^typeINfiltered,scripted');
        menuGr.query();
        while (menuGr.next()) {
            menuItems.push(menuGr.getUniqueValue());
        }
    },

    /**
     * Return all the valid spMenuitems to shown on lookup.
     * @input: portalExtensibleNavigation - glideRecord of sn_ex_sp_portal_extensible_navigation.
     **/
    getMenus: function(portalExtensibleNavigation) {
        var spMenuSysIds = [],
            menuItems = [],
            parentMenuItem = current.parent_item;
        if (!parentMenuItem) {
            this._fetchMenusForLookup(portalExtensibleNavigation.portal, '', 2, spMenuSysIds);
            this._getMenuItems(portalExtensibleNavigation, 'menu', '', menuItems);
        } else {
            var extensibleNavigation = parentMenuItem.portal_extensible_navigation;
            this._fetchMenusForLookup(extensibleNavigation.portal, '', 2, spMenuSysIds);
            this._getMenuItems(extensibleNavigation, 'menu', parentMenuItem, menuItems);
            this._getFilteredORScriptedMenus(extensibleNavigation.portal, menuItems);
            this._getSpMenusFromHierarchy(parentMenuItem, menuItems);
        }
        var menuSysIds = this._removeDuplicateLookups(spMenuSysIds, menuItems);
        return 'sys_idIN' + menuSysIds.join(',');
    },

    /**
     * Fetch all the topics based on given level and max upto 3 and stores sysids in an array
     * @input: taxonomy - portal associated taxonomy, parentSysId - tells about the parent topic, levels - depth ,
	   portalExtensibleNavigation - glideRecord of sn_ex_sp_portal_extensible_navigation, topicSysIds - contains topic sysids.
     **/
    _fetchTopicsForLookup: function(taxonomy, parentSysId, levels, portalExtensibleNavigation, topicSysIds) {
        if (levels <= 0) {
            return;
        }
        var topicGr = new GlideRecord('topic');
        topicGr.addEncodedQuery('parent_topic=' + parentSysId + '^taxonomy=' + taxonomy);
        topicGr.addActiveQuery();
        topicGr.orderBy('order');
        topicGr.query();
        while (topicGr.next()) {
            topicSysIds.push(topicGr.getUniqueValue());
            this._fetchTopicsForLookup(taxonomy, topicGr.getUniqueValue(), levels - 1, portalExtensibleNavigation, topicSysIds);
        }
    },

    /**
     * Fetch menuItems under the given parentMenuItem in sn_ex_sp_portal_extensible_navigation_item table
     * @input: navigationType - menu or topic, parentMenuItem - glideRecord of sn_ex_sp_portal_extensible_navigation_item, menuItems - array to story sysids ,
	   portalExtensibleNavigation - glideRecord of sn_ex_sp_portal_extensible_navigation, topicSysIds - contains topic sysids.
     **/

    _getMenuItems: function(portalExtensibleNavigation, navigationType, parentMenuItem, menuItems) {
        var extensibleItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        extensibleItemGr.addEncodedQuery('portal_extensible_navigation=' + portalExtensibleNavigation + '^parent_item=' + parentMenuItem + '^navigation_item_type=' + navigationType);
        extensibleItemGr.query();
        while (extensibleItemGr.next()) {
            menuItems.push(extensibleItemGr[navigationType].toString());
        }
    },

    _getNearestTopic: function(menuItemGr) {
        while (menuItemGr) {
            if (menuItemGr.navigation_item_type == 'topic') {
                return menuItemGr.topic;
            }
            menuItemGr = menuItemGr.parent_item;
        }
        return '';
    },

    _getTopicDepth: function(topic) {
        var level = 3;
        while (topic) {
            level--;
            topic = topic.parent_topic;
        }
        return level;
    },

    /**
     * Return all the valid topics to shown on lookup.
     * @input: portalExtensibleNavigation - glideRecord of sn_ex_sp_portal_extensible_navigation.
     **/
    getTopics: function(portalExtensibleNavigation) {
        var topicSysIds = [],
            menuItems = [],
            parentMenuItem = current.parent_item;
        var taxonomy, level = 3;
        if (!parentMenuItem) {
            taxonomy = this._getPortalTaxonomyWithPortalSysId(portalExtensibleNavigation.portal.toString());
            this._fetchTopicsForLookup(taxonomy, '', level, portalExtensibleNavigation, topicSysIds);
            this._getMenuItems(portalExtensibleNavigation, 'topic', '', menuItems);

        } else {
            var portalNavigation = parentMenuItem.portal_extensible_navigation;
            taxonomy = this._getPortalTaxonomyWithPortalSysId(portalNavigation.portal.toString());
            var nearestTopic = this._getNearestTopic(parentMenuItem);
            if (nearestTopic)
                level = this._getTopicDepth(nearestTopic);
            this._fetchTopicsForLookup(taxonomy, nearestTopic, level, portalNavigation, topicSysIds);
            this._getMenuItems(portalNavigation, 'topic', parentMenuItem, menuItems);
        }
        var menuTopicSysIds = this._removeDuplicateLookups(topicSysIds, menuItems);
        return 'sys_idIN' + menuTopicSysIds.join(',');
    },

    getPortalTaxonomy: function(portalId) {
        return this._getPortalTaxonomyWithPortalSysId(portalId);
    },

    _getPortalTaxonomyWithPortalSysId: function(portalId) {
        var portalTaxonomyGr = new GlideRecord("m2m_sp_portal_taxonomy");
        portalTaxonomyGr.addActiveQuery();
        portalTaxonomyGr.addQuery('sp_portal', portalId);
        portalTaxonomyGr.query();
        if (portalTaxonomyGr.next()) {
            return portalTaxonomyGr.taxonomy.toString();
        }
        return null;
    },

    // when parent_item is null, return extensible navigation items associated directly with Advanced Portal Navigation record
    _getNavItemSysIdsForALevel: function(portalExtensibleNavSysId, parent_item) {
        var extensibleNavigationItems = [];
        var extensibleItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        extensibleItemGr.addQuery('portal_extensible_navigation', portalExtensibleNavSysId);
        extensibleItemGr.addQuery('parent_item', parent_item);
        extensibleItemGr.query();
        while (extensibleItemGr.next()) {
            var type = extensibleItemGr.getValue('navigation_item_type');
            if (type == 'topic') {
                extensibleNavigationItems.push(extensibleItemGr.topic.toString());
            } else {
                extensibleNavigationItems.push(extensibleItemGr.menu.toString());
            }
        }
        return extensibleNavigationItems;
    },

    _getItem: function(extensibleItemGr) {
        var item = {
            type: extensibleItemGr.getValue('navigation_item_type'),
            order: extensibleItemGr.getValue('order') ? Number(extensibleItemGr.getValue('order')) : 99999
        };
        if (item.type == 'menu') {
            item.sysId = extensibleItemGr.menu.toString();
            item.name = extensibleItemGr.getDisplayValue('menu');
        } else {
            item.sysId = extensibleItemGr.topic.toString();
            item.name = extensibleItemGr.getDisplayValue('topic');
        }
        return item;
    },

    _getNavItem: function(extensibleItemGr, isLeftNavigationEnabled) {
        if (extensibleItemGr.parent_item && extensibleItemGr.parent_item.active == false) {
            return null;
        }

        var type = extensibleItemGr.getValue('navigation_item_type');
        var isMenu = type === 'menu';
        var reference = isMenu ? extensibleItemGr.menu : extensibleItemGr.topic;
        var item = {
            type: type,
            order: Number(extensibleItemGr.getValue('order') || 99999),
            portal_nav_item: extensibleItemGr.getUniqueValue(),
            parent_nav_item: extensibleItemGr.getValue('parent_item'),
            active: extensibleItemGr.getDisplayValue('active'),
            sys_id: reference.toString(),
            name: extensibleItemGr.getDisplayValue(isMenu ? 'menu' : 'topic'),
            render_as: extensibleItemGr.getValue('render_as'),
        };
        if (item.render_as == 'modal_window') {
            item.widget = extensibleItemGr.getValue('widget'),
            item.widget_parameters = extensibleItemGr.getValue('widget_parameters');
        }
        if (isMenu) {
            item.menu = extensibleItemGr.menu;
            item.color = item.menu.color.toString();
            item.menu_type = item.menu.type.toString();
            item.label = item.menu.label.toString();
            item.sp_page = item.menu.sp_page.toString();
            item.sp_rectangle_menu = item.menu.sp_rectangle_menu.toString();
            item.url_target = item.menu.url_target.toString();
            item.href = this._getHref(item.menu).toString();
        } else {
            item.topic = extensibleItemGr.topic;
            item.parent_topic = item.topic.parent_topic.toString();
            item.description = item.topic.description.toString();
            item.taxonomy = item.topic.taxonomy.toString();
            item.template = item.topic.template ? item.topic.template.id.toString() : "emp_taxonomy_topic";
        }
        if (isLeftNavigationEnabled) {
            var menuIcon = extensibleItemGr.getValue('menu_icon');
            item.menu_icon = (menuIcon && menuIcon !== 'empty') ? menuIcon : extensibleItemGr.portal_extensible_navigation.default_icon.toString();
            return item;
        }

        item.position = extensibleItemGr.getValue('position');
        if (item.render_as != 'modal_window') {
            item.browse_button = extensibleItemGr.getDisplayValue('browse_button');
            item.browse_button_text = extensibleItemGr.getValue('browse_button_text');
            item.submenu_type = extensibleItemGr.getValue('submenu_type');
        }
        return item;
    },

    _getHref: function(menu) {
        var qId = "?id=";
        var menuGR = new GlideRecord('sp_rectangle_menu_item');
        menuGR.get(menu);
        menuGR.query();
        if (menuGR.next()) {
            var pageId = menuGR.sp_page.id || '';
            var type = menuGR.getDisplayValue('type');
            if (type === 'Page') {
                return qId + pageId;
            } else if (type === 'URL') {
                return menuGR.getDisplayValue('url');
            }
        }
        return '';
    },

    syncPortalExtensibleNavigationItems: function(sysId, tableName) {
        var taxonomy;
        var extensibleNavItemAddedCount = 0;
        var excludeNavItems = [];
        var navItemsInParentAPN = [];
        var topicHierarchyInputs = {};
        var menuHierarchyInputs = {};
        try {
            var extensibleNavGr = new GlideRecord(tableName);
            extensibleNavGr.get(sysId);

            var navigationStyle = extensibleNavGr.getValue('navigation_style');

            excludeNavItems = this._getNavItemSysIdsForALevel(extensibleNavGr.getUniqueValue());

            taxonomy = this._getPortalTaxonomyWithPortalSysId(extensibleNavGr.portal.toString());

            topicHierarchyInputs.taxonomy = taxonomy;
            topicHierarchyInputs.portalExtensibleNavigationId = extensibleNavGr.getUniqueValue();

            menuHierarchyInputs.portalId = extensibleNavGr.portal.toString();
            menuHierarchyInputs.portalExtensibleNavigationId = extensibleNavGr.getUniqueValue();

            var topicMaxLevel = navigationStyle === 'left' ? 2 : 3;

            extensibleNavItemAddedCount += this._fetchAndSyncTopicHierarchy(topicHierarchyInputs, topicMaxLevel, true, excludeNavItems);
            extensibleNavItemAddedCount += this._fetchAndSyncMenuHierarchy(menuHierarchyInputs, 2, 0, true, excludeNavItems);



            var navItemsGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
            navItemsGr.addQuery('portal_extensible_navigation', sysId);
            navItemsGr.query();
            while (navItemsGr.next()) {
                navItemsInParentAPN.push(navItemsGr.getUniqueValue());
            }

            for (var i = 0; i < navItemsInParentAPN.length; i++) {
                var currentSysId = navItemsInParentAPN[i];


                var extensibleNavItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
                extensibleNavItemGr.get(currentSysId);
                excludeNavItems = this._getNavItemSysIdsForALevel(extensibleNavItemGr.portal_extensible_navigation, extensibleNavItemGr.getUniqueValue());
                taxonomy = this._getPortalTaxonomyWithPortalSysId(extensibleNavItemGr.portal_extensible_navigation.portal.toString());
                if (extensibleNavItemGr.navigation_item_type == 'topic') {
                    // since we are already inside topic, so now sync is allowed till max 2 more level
                    var levelAllowed = 0;
                    var menuDepth = this.getDepthOfPortalNavMenuItem(extensibleNavItemGr);
                    switch (menuDepth) {
                        case 0:
                            levelAllowed = navigationStyle === 'left' ? 1 : 3;
                            break;
                        case 1:
                            levelAllowed = navigationStyle === 'left' ? 0 : 2;
                            break;
                        case 2:
                            levelAllowed = navigationStyle === 'left' ? 0 : 1;
                            break;
                        default:
                            levelAllowed = 0;
                    }
                    if (this._getTopicDepth(extensibleNavItemGr.topic) == 0) {
                        levelAllowed = 0; // do not allow topics to sync if its already 3rd level child
                    }
                    topicHierarchyInputs.taxonomy = taxonomy;
                    topicHierarchyInputs.parentTopicSysId = extensibleNavItemGr.topic;
                    topicHierarchyInputs.portalExtensibleNavigationId = extensibleNavItemGr.portal_extensible_navigation;
                    topicHierarchyInputs.parentNavigationItemId = extensibleNavItemGr.getUniqueValue();

                    extensibleNavItemAddedCount += this._fetchAndSyncTopicHierarchy(topicHierarchyInputs, levelAllowed, true, excludeNavItems);
                } else {

                    var menuDepth = this.getDepthOfPortalNavMenuItem(extensibleNavItemGr);
                    var levelAllowed = navigationStyle === 'left' && menuDepth === 1 ? 0 : 1;

                    menuHierarchyInputs.portalId = extensibleNavItemGr.portal_extensible_navigation.portal;
                    menuHierarchyInputs.parentSysId = extensibleNavItemGr.menu;
                    menuHierarchyInputs.portalExtensibleNavigationId = extensibleNavItemGr.portal_extensible_navigation;
                    menuHierarchyInputs.parentNavigationItemId = extensibleNavItemGr.getUniqueValue();

                    extensibleNavItemAddedCount += this._fetchAndSyncMenuHierarchy(menuHierarchyInputs, levelAllowed, 0, true, excludeNavItems);
                }
            }
            return {
                status: 'SUCCESS',
                count: extensibleNavItemAddedCount
            };
        } catch (ex) {
            return {
                status: 'ERROR',
                count: -1
            };
        }
    },

    populatePortalNavigationData: function(portalExtensibleNavigationId, portalId, navigationStyle) {
        this.populatePortalNavigationItems(portalExtensibleNavigationId, portalId, navigationStyle);
        if (navigationStyle !== 'left') {
            this.populateQuickLinks(portalExtensibleNavigationId);
        }
        return;
    },

    populateQuickLinks: function(portalExtensibleNavigationId, forOnlyActiveItems) {
        // root level nav items
        var navItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        navItemGr.addNullQuery('parent_item');
        navItemGr.addQuery('portal_extensible_navigation', portalExtensibleNavigationId);
        if (forOnlyActiveItems)
            navItemGr.addActiveQuery();
        navItemGr.query();
        while (navItemGr.next()) {
            if (navItemGr.navigation_item_type == 'topic' && !gs.nil(navItemGr.topic)) {
                this._fetchAndCreateQuickLinkRecord(navItemGr);

                var childNavItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
                childNavItemGr.addQuery('parent_item', navItemGr.getUniqueValue());
                childNavItemGr.addQuery('portal_extensible_navigation', portalExtensibleNavigationId);
                childNavItemGr.query();
                while (childNavItemGr.next()) {
                    if (childNavItemGr.navigation_item_type == 'topic' && !gs.nil(childNavItemGr.topic)) {
                        this._fetchAndCreateQuickLinkRecord(childNavItemGr);
                    }
                }
            }
        }
    },

    _fetchAndCreateQuickLinkRecord: function(navMenuItemGr) {
        var connectedContentGr = new GlideRecord('m2m_connected_content');
        connectedContentGr.addQuery('content_type', '07f4b6bfe75430104cda66ef11e8a9a9' /*Quick link*/ );
        connectedContentGr.addQuery('topic', navMenuItemGr.topic);
        connectedContentGr.addQuery('quick_link.active', true);
        connectedContentGr.query();
        while (connectedContentGr.next()) {
            // for each active Quick link, create entry in m2m quicklink table
            var m2mNavItemQuickLinkGr = new GlideRecord('sn_ex_sp_m2m_portal_navigation_item_quicklink');
            m2mNavItemQuickLinkGr.initialize();
            m2mNavItemQuickLinkGr.navigation_menu_item = navMenuItemGr.getUniqueValue();
            m2mNavItemQuickLinkGr.quick_link = connectedContentGr.quick_link;
            m2mNavItemQuickLinkGr.order = connectedContentGr.order;
            m2mNavItemQuickLinkGr.insert();
        }
    },

    populatePortalNavigationItems: function(portalExtensibleNavigationId, portalId, navigationStyle) {
        var taxonomy = this._getPortalTaxonomyWithPortalSysId(portalId);
        var topicHierarchyInputs = {
            taxonomy: taxonomy,
            portalExtensibleNavigationId: portalExtensibleNavigationId
        };
        var topicMaxLevel = navigationStyle === 'left' ? 2 : 3;
        this._fetchAndSyncTopicHierarchy(topicHierarchyInputs, topicMaxLevel);

        var maxOrder = this._getMaxTopicOrder(portalExtensibleNavigationId);
        var menuHierarchyInputs = {
            portalId: portalId,
            portalExtensibleNavigationId: portalExtensibleNavigationId
        };
        this._fetchAndSyncMenuHierarchy(menuHierarchyInputs, 2, maxOrder + 100);
        return;
    },

    /**
     * Fetches topic and its childrens and creates record in sn_ex_sp_portal_extensible_navigation_item
     * @input: inputs object having properties:
     *  -- taxonomy - taxonomy of portal,
     *  -- parentTopicSysId - sys_id of topic for which its child needs to be created
     *  -- portalExtensibleNavigationId - APN records to which extensible menu item has to be associated
     *  -- parentNavigationItemId - sys_id of extensible menu item for which child are created
     * levels - maximum allowed level till which topics need to be created
     * calledFromSync - boolean true when it is called from 'Sync Hierarchy' UI action
     * excludeNavItemSysIds - sys_ids of topic which do not need to be synced
     * @output: topicsAdded - count of extensible nav item added
     **/

    fetchAndSyncTopicHierarchy: function(inputs, levels, calledFromSync, excludeNavItemSysIds) {
        return this._fetchAndSyncTopicHierarchy(inputs, levels, calledFromSync, excludeNavItemSysIds);
    },
    /**
     * Fetches topic and its childrens and creates record in sn_ex_sp_portal_extensible_navigation_item
     * @input: inputs object having properties:
     *  -- taxonomy - taxonomy of portal,
     *  -- parentTopicSysId - sys_id of topic for which its child needs to be created
     *  -- portalExtensibleNavigationId - APN records to which extensible menu item has to be associated
     *  -- parentNavigationItemId - sys_id of extensible menu item for which child are created
     * levels - maximum allowed level till which topics need to be created
     * calledFromSync - boolean true when it is called from 'Sync Hierarchy' UI action
     * excludeNavItemSysIds - sys_ids of topic which do not need to be synced
     * @output: topicsAdded - count of extensible nav item added
     **/
    _fetchAndSyncTopicHierarchy: function(inputs, levels, calledFromSync, excludeNavItemSysIds) {
        if (levels <= 0) {
            return 0;
        }
        var topicsAdded = 0;
        var topicGr = new GlideRecord('topic');
        topicGr.addQuery('parent_topic', inputs.parentTopicSysId);
        topicGr.addQuery('taxonomy', inputs.taxonomy);
        topicGr.orderBy('order');
        if (excludeNavItemSysIds && excludeNavItemSysIds.length) {
            topicGr.addQuery('sys_id', 'NOT IN', excludeNavItemSysIds);
        }
        topicGr.addActiveQuery();
        topicGr.query();

        while (topicGr.next()) {
            var portalExtensibleRecord = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
            portalExtensibleRecord.initialize();
            portalExtensibleRecord.topic = topicGr.getUniqueValue();
            if (calledFromSync) {
                portalExtensibleRecord.order = gs.nil(topicGr.getDisplayValue('order')) ? 99999 : topicGr.getDisplayValue('order');
                portalExtensibleRecord.active = true;
            } else {
                portalExtensibleRecord.order = gs.nil(topicGr.getDisplayValue('order')) ? '0' : topicGr.getDisplayValue('order');
            }
            portalExtensibleRecord.navigation_item_type = 'topic';
            portalExtensibleRecord.portal_extensible_navigation = inputs.portalExtensibleNavigationId;
            portalExtensibleRecord.parent_item = inputs.parentNavigationItemId;
            if (!inputs.parentTopicSysId) {
                portalExtensibleRecord.browse_button = true;
            }
            var id = portalExtensibleRecord.insert();
            topicsAdded++;
            if (id) {
                var childInputs = {
                    taxonomy: inputs.taxonomy,
                    parentTopicSysId: topicGr.getUniqueValue(),
                    portalExtensibleNavigationId: inputs.portalExtensibleNavigationId,
                    parentNavigationItemId: id
                };
                topicsAdded += this._fetchAndSyncTopicHierarchy(childInputs, levels - 1, calledFromSync, excludeNavItemSysIds);
            }
        }
        return topicsAdded;
    },

    /**
     * Returns the maximum order of the portal navigation item of the given portal extension navigation record
     * portalExtensibleNavigationId - sys_id of the portal extension navigation record
     **/
    getMaxMenuItemOrder: function(portalExtensibleNavigationId) {
        return this._getMaxTopicOrder(portalExtensibleNavigationId);
    },

    _getMaxTopicOrder: function(portalExtensibleNavigationId) {
        var navItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        navItemGr.addNullQuery('parent_item');
        navItemGr.addQuery('portal_extensible_navigation', portalExtensibleNavigationId);
        navItemGr.orderByDesc('order');
        navItemGr.query();
        return navItemGr.next() ? navItemGr.order : 0;
    },

    _getSpMenuForPortal: function(portal) {
        var portalGr = new GlideRecord('sp_portal');
        portalGr.get(portal);
        if (!gs.nil(portalGr)) {
            return portalGr.sp_rectangle_menu.toString();
        }
        return null;
    },

    /**
     * Fetches sp rectangle menu and its children and creates record in sn_ex_sp_portal_extensible_navigation_item
     * @input:
     * inputs object having properties:
     * -- portalId - sysId of portal,
     * -- parentSysId - sys_id of sp rectangle menu for which its child needs to be created
     * -- portalExtensibleNavigationId - APN records to which extensible menu item has to be associated
     * -- parentNavigationItemId - sys_id of extensible menu item for which child are created
     * levels - maximum allowed level till which topics need to be created
     * calledFromSync - boolean true when it is called from 'Sync Hierarchy' UI action
     * order - order set for extensible menu item
     * excludeNavItemSysIds - sys_ids of sp rectangle menu which do not need to be synced
     * @output: menusAdded - count of extensible nav item added
     **/

    fetchAndSyncMenuHierarchy: function(inputs, levels, order, calledFromSync, excludeNavItemSysIds) {
        return this._fetchAndSyncMenuHierarchy(inputs, levels, order, calledFromSync, excludeNavItemSysIds);
    },

    /**
     * Fetches sp rectangle menu and its children and creates record in sn_ex_sp_portal_extensible_navigation_item
     * @input:
     * inputs object having properties:
     * -- portalId - sysId of portal,
     * -- parentSysId - sys_id of sp rectangle menu for which its child needs to be created
     * -- portalExtensibleNavigationId - APN records to which extensible menu item has to be associated
     * -- parentNavigationItemId - sys_id of extensible menu item for which child are created
     * levels - maximum allowed level till which topics need to be created
     * calledFromSync - boolean true when it is called from 'Sync Hierarchy' UI action
     * order - order set for extensible menu item
     * excludeNavItemSysIds - sys_ids of sp rectangle menu which do not need to be synced
     * @output: menusAdded - count of extensible nav item added
     **/
    _fetchAndSyncMenuHierarchy: function(inputs, levels, order, calledFromSync, excludeNavItemSysIds) {
        if (levels <= 0) {
            return 0;
        }
        var menusAdded = 0;
        var menuGr = new GlideRecord('sp_rectangle_menu_item');
        if (inputs.parentSysId) {
            menuGr.addEncodedQuery("sp_rectangle_menu_item=" + inputs.parentSysId + "^typeNOT INfiltered,scripted");
        } else {
            menuGr.addEncodedQuery("sp_rectangle_menu=" + this._getSpMenuForPortal(inputs.portalId) + "^sys_id!=01ef85b65368301056c1ddeeff7b12ce");
        }
        menuGr.orderBy('order');
        if (excludeNavItemSysIds && excludeNavItemSysIds.length) {
            menuGr.addQuery('sys_id', 'NOT IN', excludeNavItemSysIds);
        }
        menuGr.addActiveQuery();
        menuGr.query();
        while (menuGr.next()) {
            var portalExtensibleRecord = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
            portalExtensibleRecord.initialize();
            portalExtensibleRecord.menu = menuGr.getUniqueValue();
            if (calledFromSync) {
                portalExtensibleRecord.order = 99999;
                portalExtensibleRecord.active = true;
            } else {
                if (inputs.parentSysId) {
                    portalExtensibleRecord.order = menuGr.getDisplayValue('order');
                } else {
                    portalExtensibleRecord.order = order;
                    order = order + 100;
                }
            }
            portalExtensibleRecord.navigation_item_type = 'menu';
            portalExtensibleRecord.portal_extensible_navigation = inputs.portalExtensibleNavigationId;
            portalExtensibleRecord.parent_item = inputs.parentNavigationItemId;
            var menuIcon = menuGr.getValue('glyph');
            if (menuIcon) {
                portalExtensibleRecord.menu_icon = menuIcon;
            }
            var id = portalExtensibleRecord.insert();
            menusAdded++;
            if (id) {
                var childInputs = {
                    portalId: inputs.portalId,
                    parentSysId: menuGr.getUniqueValue(),
                    portalExtensibleNavigationId: inputs.portalExtensibleNavigationId,
                    parentNavigationItemId: id
                };
                menusAdded += this._fetchAndSyncMenuHierarchy(childInputs, levels - 1, order, calledFromSync, excludeNavItemSysIds);
            }
        }
        return menusAdded;
    },

    // returns all extensible navigation items for a extensible navigation record
    getExtensibleNavigationItems: function(portalId, fetchAll) {
        var extensibleNavigationItems = [];
        var extensibleNavigationGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation');
        if (!fetchAll) {
            extensibleNavigationGr.addActiveQuery();
        }
        extensibleNavigationGr.addQuery('portal', portalId);
        extensibleNavigationGr.query();
        if (extensibleNavigationGr.next()) {
            var extensibleItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
            extensibleItemGr.addActiveQuery();
            extensibleItemGr.addQuery('portal_extensible_navigation', extensibleNavigationGr.getUniqueValue());
            extensibleItemGr.query();
            while (extensibleItemGr.next()) {
                var item = this._getItem(extensibleItemGr);
                extensibleNavigationItems.push(item);
            }
            extensibleNavigationItems.sort(function(a, b) {
                if (a.order > b.order) {
                    return 1;
                } else if (a.order < b.order) {
                    return -1;
                } else {
                    if (a.name > b.name) {
                        return 1;
                    }
                    return -1;
                }
            });
        }
        return extensibleNavigationItems;
    },

    // returns '0' when menuItem is at root level
    getDepthOfPortalNavMenuItem: function(portalNavMenuItem) {
        var navItemDepth = 0;
        var parent = portalNavMenuItem.parent_item;
        while (parent) {
            navItemDepth++;
            parent = parent.parent_item;
        }
        return navItemDepth;
    },

    getUIFormatterContent: function(navigationItem) {
        if (navigationItem.isNewRecord() && !navigationItem.parent_item) {
            return '';
        }
        var pathItems = [];
        this.getMenuItemParents(pathItems, navigationItem);
        var path = "";
        var dir = gs.getProperty("text_direction");
        if (!dir) {
            dir = 'ltr';
        }
        var pathSeperator = dir == "ltr" ? " / " : " \\ ";
        pathItems.forEach(function(item) {
            if (item) {
                path = path + pathSeperator + item;
            }
        });
        return path;
    },

    getMenuItemParents: function(pathItems, navigationItem) {
        pathItems.unshift(navigationItem.getDisplayValue());
        if (navigationItem.parent_item) {
            this.getMenuItemParents(pathItems, navigationItem.parent_item);
        }
    },

    getTopPortalNavMenuItemDisplayType: function(portalNavMenuItem) {
        var topNavMenuItem = portalNavMenuItem;
        var parent = portalNavMenuItem.parent_item;
        while (parent) {
            topNavMenuItem = (parent.parent_item) ? (parent.parent_item) : parent;
            parent = parent.parent_item;
        }
        if (topNavMenuItem.render_as == 'menu') {
            return topNavMenuItem.submenu_type;
        }
        return;
    },

    getActivePortalNavRecord: function(portalId) {
        var portalNavGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation');
        portalNavGr.addActiveQuery();
        portalNavGr.addQuery('portal', portalId);
        portalNavGr.query();
        if (portalNavGr.next()) {
            return portalNavGr;
        }
        return null;
    },

    getQuickLinkListForNavItem: function(navItemId) {
        var quickLinks = [];
        var navItemQuickLinkGr = new GlideRecord('sn_ex_sp_m2m_portal_navigation_item_quicklink');
        navItemQuickLinkGr.addQuery('navigation_menu_item', navItemId);
        navItemQuickLinkGr.addQuery('quick_link.active', true);
        navItemQuickLinkGr.orderBy('order');
        navItemQuickLinkGr.query();
        while (navItemQuickLinkGr.next()) {
            var navItemQuickLink = new sn_ex_sp.QuickLinkUtil().fetchQuicklinkRecordForPortalNavMenuItem(navItemQuickLinkGr);
            if (!gs.nil(navItemQuickLink)) {
                quickLinks.push(navItemQuickLink);
            }
        }
        return quickLinks;
    },

    getTopicCountInHierarchy: function(navMenuItem) {
        var topicCount = 0;
        var parentNavItem = navMenuItem.parent_item;
        while (parentNavItem) {
            if (parentNavItem.navigation_item_type == 'topic')
                topicCount++;

            parentNavItem = parentNavItem.parent_item;
        }
        return topicCount;
    },

    getActivePortalNavMenuItems: function(portalNavRecord, isLeftNavigationEnabled) {
        var portalNavMenuItems = [];
        var cacheKey = 'APNMenuItems_'.concat(portalNavRecord, '_', gs.getSession().getLanguage());
        var navMenuItemsFromCache = sn_scoped_cache.ScopedCacheManager.get(this.EMPLOYEE_CENTER_CACHE, cacheKey);
        if (navMenuItemsFromCache)
            portalNavMenuItems = JSON.parse(navMenuItemsFromCache);
        else {
            var portalNavMenuItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
            portalNavMenuItemGr.addActiveQuery();
            portalNavMenuItemGr.addQuery('portal_extensible_navigation', portalNavRecord);
            portalNavMenuItemGr.query();

            while (portalNavMenuItemGr.next()) {
                if (
                    isLeftNavigationEnabled &&
                    !gs.nil(portalNavMenuItemGr.parent_item.parent_item)
                ) {
                    continue;
                }
                var navItem = this._getNavItem(portalNavMenuItemGr, isLeftNavigationEnabled);
                if (navItem)
                    portalNavMenuItems.push(JSON.parse(JSON.stringify(navItem)));
            }
            portalNavMenuItems.sort(function(a, b) {
                if (a.order > b.order) {
                    return 1;
                } else if (a.order < b.order) {
                    return -1;
                } else
                    return a.name.localeCompare(b.name);
            });
            sn_scoped_cache.ScopedCacheManager.put(this.EMPLOYEE_CENTER_CACHE, cacheKey, JSON.stringify(portalNavMenuItems));
        }

        return portalNavMenuItems;
    },

    deleteInvalidRecords: function() {
        var gr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        gr.query();
        while (gr.next()) {
            var table = gr.getValue('navigation_item_type') == 'topic' ? 'topic' : 'sp_rectangle_menu_item';
            var sys_id = table == 'topic' ? gr.getValue('topic') : gr.getValue('menu');
            if (!this._isValidRecord(table, sys_id))
                gr.deleteRecord();
        }
    },

    _isValidRecord: function(table, sys_id) {
        var gr = new GlideRecord(table);
        return gr.get(sys_id);
    },

    getSessionId: function() {
        var key = 'unique_session_id';
        var sessionId = gs.getSession().getClientData(key);
        if (!sessionId) {
            sessionId = gs.generateGUID();
            gs.getSession().putClientData(key, sessionId);
        }
        return sessionId;
    },
    /**
     * Updates the sp portal menu items active status
     * menuItems - list of EC menu items to be activated or deactivated 
     * activeFlag - boolean indicating whether to activate or deactivate
     * spMenuId - menu id of employee center
     **/
    updateMenuItemsStatus: function(menuItems,activeFlag) {
        var menuItemGr = new GlideRecord("sp_rectangle_menu_item");
        menuItemGr.addQuery("sys_id", "IN", menuItems);
        menuItemGr.query();
        while (menuItemGr.next()) {
            menuItemGr.setValue("active", activeFlag);
            menuItemGr.update();
        }
    },

     /**
     * Deactivates the existing navigation record and activates the given extensible navigation.
     * portalId - sys_id of the the advanced portal navigation
     * extensibleNavigationId - sys_id of the advanced portal
     **/
    setPortalExtensibleNavActive: function(portalId, extensibleNavigationId) {
        var navGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation');
        navGr.addEncodedQuery('portal=' + portalId + '^active=true^NQ' + 'portal=' + portalId + '^sys_id=' + extensibleNavigationId);
        navGr.orderByDesc('active');
        navGr.query();
        while (navGr.next()) {
            var isTarget = navGr.getUniqueValue() == extensibleNavigationId;
            navGr.setValue('active', isTarget);
            navGr.update();
        }
    },
    type: 'PortalExtensibleNavigationUtilSNC'
};
