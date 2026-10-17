var emreOptInAjax = Class.create();
emreOptInAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getEMREPageRouteMap: function() {
        var pageRouteGr = new GlideRecordSecure("sp_page_route_map");
        pageRouteGr.addQuery('sys_id', 'a661b335ff302210ac09ffffffffffa7'); // sys_id of new request experience page
        pageRouteGr.query();
        return pageRouteGr;
    },

    optIn: function() {
        this.enableDisablePageRoutes(true);
        return true;
    },

    optOut: function() {
        this.enableDisablePageRoutes(false);
        return true;
    },

    enableDisablePageRoutes: function(isActive) {
        var pageRouteGr = this.getEMREPageRouteMap();
        while (pageRouteGr.next()) {
            pageRouteGr.active = isActive;
            pageRouteGr.update();
        }
    },

    fetchOptInDetails: function() {
        var result = {
            active: false
        };
        var pageRouteGr = this.getEMREPageRouteMap();
        while (pageRouteGr.next()) {
            result.active = pageRouteGr.getValue('active') == true;
        }
        return JSON.stringify(result);
    },

    type: 'emreOptInAjax'
});
