var KnowledgeContentProcessorSNC = Class.create();
KnowledgeContentProcessorSNC.prototype = {
    /**
     * Returns the table name of content which is processed
     * @return String
     */
    getTableName: function() {
        return 'kb_knowledge';
    },

    /**
     * Returns true or false whether a user has access to view the content record
     * @param String - recordId
     * @param String - userId
     * @param boolean - isMobile
     * @return Boolean
     */
    canView: function(recordId, userId, isMobile) {
        var kbGr = new GlideRecord(this.getTableName());
        kbGr.get(recordId);
        return kbGr.canRead();
    },

	/**
     * Returns true or false whether a user has access to a set of content record
     * @param list - contentIds
     * @param String - userId
     * @param boolean - isMobile
     * @return Boolean
     */
     bulkCanView: function(contentIds, userId, isMobile) {
        var kbGr = new GlideRecord(this.getTableName());
        kbGr.addQuery("sys_id", 'IN', contentIds);
        kbGr.query();
        while(kbGr.next()) {
            if (kbGr.canRead()) {
                return true;
            }
        }
        return false;
    },

    /**
     * Returns popularity of content, which is used to order the content while displaying
     * @param String - comma separated knowledge article sys_id's
     * @return Object
     */
    getPopularity: function(articleIds) {
        var contentPopularityMap = {};
        var gr = new GlideRecord(this.getTableName());
        gr.addQuery('sys_id', 'IN', articleIds);
        gr.query();
        while (gr.next())
            contentPopularityMap[gr.getUniqueValue()] = parseInt(gr.getValue('sys_view_count'));

        return contentPopularityMap;
    },

    /**
     * Returns true if the article passes the specified filter conditions for article authoring experience
	 * @param GlideRecord -  knowledge record
     * @return Boolean
     */
    isContentAuthoringAllowed: function(knowledgeGr) {
		if(gs.nil(knowledgeGr))
			return false;
		
		return new KBKnowledge().canCreateRelatedListRecord(knowledgeGr);
    },

    getCategoryFieldsMap: function(){
        var categoryFieldsMap = {};
        categoryFieldsMap['category'] = 'knowledge';
        categoryFieldsMap['categoryColumn'] = 'kb_category';
        categoryFieldsMap['categoryLabel'] = 'label';
        categoryFieldsMap['categoryParent'] = 'parent_id';
        return categoryFieldsMap;
    },
	
    type: 'KnowledgeContentProcessorSNC'
};
