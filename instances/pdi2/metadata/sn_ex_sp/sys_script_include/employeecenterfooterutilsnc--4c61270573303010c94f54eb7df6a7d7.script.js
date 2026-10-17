var EmployeeCenterFooterUtilSNC = Class.create();
EmployeeCenterFooterUtilSNC.prototype = {
    initialize: function() {
        this.log = new global.GSLog("com.snc.sn_ex_sp.log.level", this.type);
        this.EMPLOYEE_CENTER_CACHE = 'employee_center_cache';
    },

    /* 
     * Retrieve footer record associated to portal 
     */
    getFooterRecord: function(portalId) {
        var footerGr = new GlideRecord('sn_ex_sp_footer');
        footerGr.addQuery(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.PORTAL, 'CONTAINS', portalId);
        footerGr.addActiveQuery();
        footerGr.setLimit(1);
        footerGr.orderBy(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.NAME); // Recommended during ARB review - customer can create duplicate footer by by-passing BR check, in such case first footer by alphabetic order will be considered.   
        footerGr.query();
        if (footerGr.next()) {
            return footerGr;
        }
    },

    /* 
     * Retrieve menu items associated to sp_instance_menu. Menu items are filtered based on condition script on each item.
     */
    getMenuItems: function($sp, menuSysId) {
        if (menuSysId) {
            var spInstanceMenuGr = new GlideRecord('sp_instance_menu');
            if (spInstanceMenuGr.get(menuSysId) && spInstanceMenuGr.active) {
                return $sp.getMenuItems(menuSysId);
            }
        }
    },

    /* 
     * Returns Logo, Main Menus, Copywrite text, Social Icons details 
     */
    getFooterDetails: function($sp) {
        var portalId = $sp.getPortalRecord().sys_id + "";
        var details = {};
        var cacheKey = 'footerDetails_'.concat(portalId, '_', gs.getSession().getLanguage(), gs.getUserID());
        var footerDetailsFromCache = sn_scoped_cache.ScopedCacheManager.get(this.EMPLOYEE_CENTER_CACHE, cacheKey);
        if (footerDetailsFromCache) {
            details = JSON.parse(footerDetailsFromCache);
        } else {
            var footerGr = this.getFooterRecord(portalId);
            if (!footerGr) {
                this.log.info("[getFooterDetails] footer configuration is not defined for portal " + portalId);
                return details;
            }

            details.sysId = footerGr.getUniqueValue();

            if (footerGr.getValue(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.LOGO) || footerGr.getValue(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.ORGANIZATION_CONTENT)) {
                details.logo = {};
                details.logo.imageUrl = footerGr.getDisplayValue(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.LOGO);
                details.logo.content = footerGr.getDisplayValue(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.ORGANIZATION_CONTENT);

                // Format text to html
                if (details.logo.content)
                    details.logo.content = details.logo.content.replace(/\n/g, "<br/>");
            }

            details.copyright = footerGr.getDisplayValue(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.COPYRIGHT);

            /* Construct menus */
            details.menus = {};
            var footerMenuGr = new GlideRecord('sn_ex_sp_footer_menu');
            footerMenuGr.addQuery(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.FOOTER, footerGr.getUniqueValue());
            footerMenuGr.orderBy(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.ORDER);
            footerMenuGr.query();


            while (footerMenuGr.next()) {
                if (footerMenuGr.menu && (footerMenuGr.menu.active + '' === 'true') && gs.hasRole(footerMenuGr.menu.roles + '')) {
                    var menuType = footerMenuGr.getValue(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.LINK_TYPE);
                    var menuItems;
                    var title = footerMenuGr.menu[EmployeeCenterConstants.TABLE.SP_INSTANCE_MENU.FIELDS.TITLE] + '';

                    menuItems = this.getMenuItems($sp, footerMenuGr.menu + '');
                    if (!details.menus[menuType])
                        details.menus[menuType] = [];
                    details.menus[menuType].push({
                        title: title,
                        sysId: footerMenuGr.getUniqueValue(),
                        menuItems: menuItems
                    });
                }
            }
            sn_scoped_cache.ScopedCacheManager.put(this.EMPLOYEE_CENTER_CACHE, cacheKey, JSON.stringify(details));
        }
        return details;
    },

    /*
     * Returns `true` if one of portals already associated to another active footer definition.
     */
    isPortalHasFooter: function(current /* sn_ex_sp_footer */ ) {
        var portalIds = current.getValue(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.PORTAL);
        if (current.active && portalIds) { // if current record is inactive, no need to pass this check.
            portalIds = portalIds.split(',');
            for (var i = 0; i < portalIds.length; i++) {
                var portalId = portalIds[i];
                var footerGr = new GlideAggregate('sn_ex_sp_footer');
                footerGr.addQuery('sys_id', '!=', current.getUniqueValue());
                footerGr.addQuery(EmployeeCenterConstants.TABLE.FOOTER.FIELDS.PORTAL, 'CONTAINS', portalId);
                footerGr.addQuery('active', true); // GlideAggregate doesn't support addActiveQuery
                footerGr.setLimit(1);
                footerGr.query();
                if (footerGr.hasNext()) {
                    var portalGr = new GlideRecord("sp_portal");
                    portalGr.get(portalId);
                    var errorMesg = gs.getMessage('"{0}" portal is already associated to another active footer.', portalGr.getValue('title'));
                    gs.addErrorMessage(errorMesg);
                    return true;
                }
            }
        }
        return false;
    },

    /*
     * Returns 'true' if footer already has same menu associated.
     */
    isMenuUnique: function(current /* sn_ex_sp_footer_menu */ ) {
        var footerMenuGr = new GlideAggregate('sn_ex_sp_footer_menu');
        footerMenuGr.addQuery('sys_id', '!=', current.getUniqueValue());
        footerMenuGr.addQuery(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.FOOTER, current.getValue(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.FOOTER));
        footerMenuGr.addQuery(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.MENU, current.getValue(EmployeeCenterConstants.TABLE.FOOTER_MENU.FIELDS.MENU));
        footerMenuGr.setLimit(1);
        footerMenuGr.query();
        return footerMenuGr.hasNext();
    },

    /*
     * Returns 'true' if footer is fixed.
     */
    isFooterFixed: function(portalId) {
        var portalGr = new GlideRecord('sp_portal');
        portalGr.addQuery('sys_id', portalId);
        portalGr.addActiveQuery();
        portalGr.query();
        if (portalGr.next()) {
            var themeId = portalGr.getValue('theme');
            var themeGr = new GlideRecord('sp_theme');
            themeGr.addQuery('sys_id', themeId);
            themeGr.addActiveQuery();
            themeGr.query();
            if (themeGr.next() && themeGr.getValue('footer_fixed') === 'true') {
                return true;
            }
        }
        return false;
    },

    type: 'EmployeeCenterFooterUtilSNC'
};
