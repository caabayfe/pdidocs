var TaxonomyUtilAjax = Class.create();
TaxonomyUtilAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    checkManagerAccess: function() {
        var taxonomy = this.getParameter('sysparm_taxonomy');
        var gr = new GlideRecord('taxonomy');
        gr.addQuery('sys_id', taxonomy);
        gr.query();
        if (gr.next() && (gs.hasRole("taxonomy_admin") || sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [gr.managers]) || new global.TopicPermissionUtil().isAnyTopicManager()))
            return true;
        return false;
    },

    getOutdatedContentUrl: function() {
        var outdatedContentEncodedQuery = this.getOutdatedContentEncodedQuery();
        var outdatedContentListUrl = "m2m_connected_content_list.do?sysparm_view=outdated_connected_content&sysparm_query=" + encodeURIComponent(outdatedContentEncodedQuery);
        var result = this.newItem("result");
        result.setAttribute("url", outdatedContentListUrl);
    },

    getOutdatedContentEncodedQuery: function() {
        var outdatedContentEncodedQuery = '';
        var configGr = new GlideRecordSecure('taxonomy_content_configuration');
        configGr.addQuery("connected_content_table", "m2m_connected_content");
        configGr.query();
        var index = 0;
        while (configGr.next()) {
            var condition = configGr.getValue('conditions');
            if (gs.nil(condition)) {
                continue;
            }
            if (condition.substring(condition.length - 3, condition.length) == "^EQ") {
                condition = condition.substring(0, condition.length - 3);
            }
            if (index > 0) {
                outdatedContentEncodedQuery += "^NQ";
            }
            outdatedContentEncodedQuery = outdatedContentEncodedQuery + condition;
            index++;
        }
        return outdatedContentEncodedQuery ? outdatedContentEncodedQuery : "sys_id=null";
    },

    type: 'TaxonomyUtilAjax'
});
