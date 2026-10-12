var TaxonomyContentProcessor = Class.create();
TaxonomyContentProcessor.prototype = {
    /**
     * Returns the table name of content which is processed
     * @return String
     */
    getTableName: function() {
        return "";
    },

    /**
     * Returns true or false whether a user has access to view the content record
     * @param String - contentId
     * @param String - userId
     * @param boolean - isMobile
     * @param String - topicID (optional)
     * @return Boolean
     */
    canView: function(contentId, userId, isMobile, topicID) {
        return false;
    },

	/**
     * Returns true or false whether a user has access to a set of content record
     * @param list - contentIds
     * @param String - userId
     * @param boolean - isMobile
     * @return Boolean
     */
    bulkCanView: function(contentIds, userId, isMobile) {
        return false;
    },

    /**
     * Returns popularity of content, which is used to order the content while displaying
     * @param String - comma separated content sys_id's
     * @return Object
     */
    getPopularity: function(contentIds) {
        var contentPopularityMap = {};
        return contentPopularityMap;
    },

    /**
     * Returns if the the content passes the specified filter conditions for content authoring experience
     * @return Boolean
     */
    isContentAuthoringAllowed: function(record) {
        return true;
    },
	
    getCategoryFieldsMap: function(){
        var categoryFieldsMap = {};
        return categoryFieldsMap;
    },
    
    type: 'TaxonomyContentProcessor'
};
