var PortalExtensibleNavigationAjax = Class.create();
PortalExtensibleNavigationAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    syncExtensibleMenuItems: function() {
        var sysId = this.getParameter('sysparm_sysId');
        var tableName = this.getParameter('sysparm_tableName');
        if (!sysId || !tableName) {
            gs.error(gs.getMessage('Missing sysId or tableName parameter.'));
            return;
        }
        var gr = new GlideRecord(tableName);

        if (gr.get(sysId)) {
            gr.sync_status = 'in_progress';
            gr.update();
        }
    },

    getParentSyncStatus: function() {
        var childNavItemSysId = this.getParameter('childNavItemSysId');
        if (!childNavItemSysId) return '';

        var childNavItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        if (childNavItemGr.get(childNavItemSysId) && childNavItemGr.portal_extensible_navigation) {
            return childNavItemGr.portal_extensible_navigation.sync_status;
        }
        return '';
    },

    fetchPortalMenuItemsData: function() {
        var portalExtensibleNavRecordId = this.getParameter('sysparm_sysId');
        var portal = this.getParameter('sysparm_portal');
        var active = this.getParameter('sysparm_active');
        var navigationStyle = this.getParameter('sysparm_navigationStyle');
        var portalExtensibleNavigation = new sn_ex_sp.PortalExtensibleNavigationUtil();
        if (active == 'true' && portalExtensibleNavigation.getActivePortalNavRecord(portal)) {
            return;
        }
        portalExtensibleNavigation.populatePortalNavigationData(portalExtensibleNavRecordId, portal, navigationStyle);
    },
    type: 'PortalExtensibleNavigationAjax'
});
