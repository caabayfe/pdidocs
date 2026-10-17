var ExternalLinkUtilSNC = Class.create();
ExternalLinkUtilSNC.prototype = {
    initialize: function() {
        this.CAN_VIEW_TABLE = "sn_ex_sp_ext_link_user_criteria_mtom";
        this.CANNOT_VIEW_TABLE = "sn_ex_sp_ext_link_user_criteria_no_mtom";
    },

    canRead: function (externalLinks) {
        if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), 
        this._fetchUserCriteria(externalLinks, this.CANNOT_VIEW_TABLE)))
            return false;

        var canViewCriteriaList = this._fetchUserCriteria(externalLinks, this.CAN_VIEW_TABLE);
        if(!canViewCriteriaList.length)
            return true;
        if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), canViewCriteriaList))
            return true;

        return false;
    },

    _fetchUserCriteria: function(externalLinks, table) {
        var gRecord = new GlideRecord(table);
        gRecord.addQuery('sn_ex_sp_external_link', externalLinks);
        gRecord.query();
        var criteriaList = [];
        while (gRecord.next()) {
            criteriaList.push(gRecord.user_criteria.sys_id);
        }
        return criteriaList;
    },

    type: 'ExternalLinkUtilSNC'
};
