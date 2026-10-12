var StaticContentUtilSNC = Class.create();
StaticContentUtilSNC.prototype = {
    initialize: function() {
        this.STATICCONTENT_TABLE = "sn_ex_sp_static_content";
        this.STATICCONTENT_AVAILABLE_FOR_TABLE = "sn_ex_sp_static_content_user_criteria_mtom";
        this.STATICCONTENT_NOT_AVAILABLE_FOR_TABLE = "sn_ex_sp_static_content_user_criteria_no_mtom";
    },

    /**
     * This function fetches user criteria for a record
     * @param {GlideRecord} support_type
     * @param {String} userCriteriaTable
     * @returns criteriaList
     */
    _fetchUserCriteria: function(contentRecord, userCriteriaTable) {
        var gRecord = new GlideRecord(userCriteriaTable);
        gRecord.addQuery(contentRecord.getTableName(), contentRecord.sys_id);
        gRecord.query();
        var criteriaList = [];
        while (gRecord.next()) {
            criteriaList.push(gRecord.user_criteria);
        }
        return criteriaList;
    },

    /**
     * This function checks if a staticContentRecord record can be viewed by the current user
     * @param {GlideRecord} staticContentRecord
     * @returns true/false
     */
    _staticContentCanView: function(staticContentRecord) {
        var cannotViewCriteriaList = this._fetchUserCriteria(staticContentRecord, this.STATICCONTENT_NOT_AVAILABLE_FOR_TABLE);
        if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), cannotViewCriteriaList)) {
            return false;
        }
        var canViewCriteriaList = this._fetchUserCriteria(staticContentRecord, this.STATICCONTENT_AVAILABLE_FOR_TABLE);
        if (!canViewCriteriaList.length) {
            return true;
        }
        if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), canViewCriteriaList)) {
            return true;
        }
        return false;
    },

    /**
     * This function returns static content records in JSON format
     * @param {GlideRecord} staticContentRecord
     * @returns Object
     */
    _fetchStaticContentJSON: function(staticContentRecord) {
        if (staticContentRecord.isValidRecord()) {
            if (this._staticContentCanView(staticContentRecord)) {
                return {
                    'title': staticContentRecord.getDisplayValue('title'),
                    'richText': staticContentRecord.getDisplayValue('rich_text'),
                    'id': staticContentRecord.getUniqueValue()
                };
            }
        }
    },

    _pushNotNull: function(array, value) {
        if (value) {
            array.push(value);
        }
    },

    /**
     * This function fetches static content records
     * @param {String} staticContentList
     * @returns staticContent
     */
    fetchStaticContent: function(staticContentList) {
        var gRecord = new GlideRecord(this.STATICCONTENT_TABLE);
        gRecord.addQuery('sys_id', 'IN', staticContentList);
        gRecord.addActiveQuery();
        gRecord.query();
        var staticContent = [];
        var staticContentMap = {};
        while (gRecord.next()) {
            staticContentMap[gRecord.sys_id] = this._fetchStaticContentJSON(gRecord);
        }
        var staticContentArray = staticContentList.split(',');
        for (var i = 0; i < staticContentArray.length; i++) {
            this._pushNotNull(staticContent, staticContentMap[staticContentArray[i]]);
        }
        return staticContent;
    },

    type: 'StaticContentUtilSNC'
};
