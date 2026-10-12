var TaxonomyMobileUtilSNC = Class.create();
TaxonomyMobileUtilSNC.prototype = {
    initialize: function() {
        this.mobileServicePortal = "26f2fffb77322300454792718a1061e5";
    },

    /**
     * returns a taxonomy associated to mobile portal 
     */
    getMobileServicePortalTaxonomy: function() {
        var portalTaxonomyGr = new GlideRecord('m2m_sp_portal_taxonomy');
        portalTaxonomyGr.addQuery('sp_portal', this.mobileServicePortal);
        portalTaxonomyGr.orderBy('order');
        portalTaxonomyGr.setLimit(1);
        portalTaxonomyGr.query();
        if (portalTaxonomyGr.next())
            return portalTaxonomyGr.getValue('taxonomy').toString();

    },

    type: 'TaxonomyMobileUtilSNC'
};
