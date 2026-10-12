var CompanyEventsUtilSNC = Class.create();
    CompanyEventsUtilSNC.prototype = {
        initialize: function() {},

        /**
         * Retrieves advanced portal navigation menu items associated with a surged event,
         * and caches the results to enhance performance.
         *
         * @param {String} portalNavRecordId (sys_id) of the advanced portal navigation record
         * @param {Boolean} isLeftNavigationEnabled (true/false) whether left navigation is enabled or not
         */
        getLightWeightMenuItems: function(portalNavRecordId, isLeftNavigationEnabled) {
            var portalNavUtil = new sn_ex_sp.PortalExtensibleNavigationUtil();
            var portalNavMenuItems = portalNavUtil.getActivePortalNavMenuItems(portalNavRecordId, isLeftNavigationEnabled);
            var parsedNavMenuItems = this.parseNavMenuItems(portalNavMenuItems);
            return {
                portalNavMenuItems: portalNavMenuItems,
                parsedNavMenuItems: parsedNavMenuItems
            };
        },

        /**
         * Parses menu items associated with a surged event,
         * and caches the results to enhance performance.
         *
         * @param {Object} portalNavMenuItems, menu items for advanced portal navigation record
         */
        parseNavMenuItems: function(portalNavMenuItems) {
            var menuItems = [];
            for (var i = 0; i < portalNavMenuItems.length; i++) {
                menuItems.push({
                    "sp_rectangle_menu": portalNavMenuItems[i].sp_rectangle_menu,
                    "color": "default",
                    "active": portalNavMenuItems[i].active,
                    "label": portalNavMenuItems[i].label,
                    "type": portalNavMenuItems[i].menu_type,
                    "sys_class_name": "sp_rectangle_menu_item",
                    "url": portalNavMenuItems[i].href,
                    "sys_id": portalNavMenuItems[i].sys_id,
                    "glyph": portalNavMenuItems[i].label,
                    "url_target": portalNavMenuItems[i].url_target,
                    "href": portalNavMenuItems[i].href,
                    "order": portalNavMenuItems[i].order
                });
            }
            return menuItems;
        },

        type: 'CompanyEventsUtilSNC'
    };
