var NAM_KPI_ACL = Class.create();
NAM_KPI_ACL.prototype = {

    initialize: function() {},

    hasAccess: function() {
        if (gs.nil(current.analytics_source.table)) {
            return true;
        } else {
            var gr = new GlideRecord(current.analytics_source.table);
            return (gr.isValid() && GlideSecurityManager.tableLevelACLAllow(gr, 'read'));
        }
    },

    type: 'NAM_KPI_ACL'
};
