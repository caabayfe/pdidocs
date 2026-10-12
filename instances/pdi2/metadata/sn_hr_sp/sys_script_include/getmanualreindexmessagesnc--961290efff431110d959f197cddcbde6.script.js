var GetManualReindexMessageSNC = Class.create();
GetManualReindexMessageSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    collectTablesForManualReIndex: function() {

        var topicId = this.getParameter('sysparam_topic');
        var hasRole = gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager() || new global.TopicPermissionUtil().isTopicManager(topicId);
        // return null if correct roles are not present
        if(!hasRole) return null;
        
        var isAisEnabled = new sn_ais.StatusApi().isAisEnabled() && gs.getProperty('taxonomy.aisearch.enabled.utah');
        if(!isAisEnabled) return null;

        // continue only if correct roles are present and ais is enabled
        var portalQuery = new GlideRecord('sp_portal');
        portalQuery.get('70cd9f3b734b13001fdae9c54cf6a72f');
        var portalQuerySearchProfile = portalQuery.getDisplayValue('search_application.search_profile');
        var collect_table = [];
        var connected_content = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        var taxonomyJoincheckQuery = connected_content.addJoinQuery('taxonomy_content_configuration', 'search_source.datasource.source', 'content_table');
        connected_content.addEncodedQuery('profile.label=' + portalQuerySearchProfile);
        taxonomyJoincheckQuery.addCondition('active', 'true');
        connected_content.query();
        var displayStringTables = '';
        while (connected_content.next()) {
            var to_push = connected_content.getDisplayValue('search_source.datasource');
            collect_table.push(to_push);
        }

        var collect_table_unique = collect_table.filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });
        displayStringTables = '';
        for (var i = 0; i < collect_table_unique.length; i++) {
            displayStringTables += collect_table_unique[i];
            if (i != collect_table_unique.length - 1) {
                displayStringTables += " , ";
            }
        }
        var response ={};
        if (displayStringTables){
            response.message = gs.getMessage('Topic table changes need to be manually reindexed for their corresponding indexed sources. Please manually reindex these table names: {0}',displayStringTables);
        }
        return JSON.stringify(response);
    },
    type: 'GetManualReindexMessageSNC'
});
