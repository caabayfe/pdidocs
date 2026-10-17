var ValidateAlternatePortal = Class.create();
ValidateAlternatePortal.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getReferencedAlternatePortals: function() {
        var ans = "";
        var portalId = this.getParameter('portalId');

        // Check if portalId parameter is provided
        if (!portalId) {
            gs.error("portalId parameter is missing");
            return "";
        }
        var gr = new GlideRecord('sp_portal');
        gr.addQuery('inactive', true);
        gr.addQuery('alternate_portal', portalId);
        gr.query();
        while (gr.next()) {
            if (ans == "")
                ans += gr.getValue("title");
            else
                ans +=  ", " + gr.getValue("title");
        }
        return ans;
    },
    getPortalTitleFromId: function() {
        var portalId = this.getParameter('portalId');
        var gr = new GlideRecord('sp_portal');
        if (gr.get(portalId))
            return gr.getValue("title");
        return "";
    },
    isPortalInActive: function() {
        var portalId = this.getParameter('portalId');
        var gr = new GlideRecord('sp_portal');
        if (gr.get(portalId))
            return gr.getValue("inactive") == "1";
        return "";
    },
    isPortalDefault: function() {
        var portalId = this.getParameter('portalId');
        var gr = new GlideRecord('sp_portal');
        if (gr.get(portalId))
            return gr.getValue("default") == "1";
        return "";
    },

    type: 'ValidateAlternatePortal'
});
