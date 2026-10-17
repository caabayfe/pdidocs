var QuickLinkContentProcessorSNC = Class.create();
QuickLinkContentProcessorSNC.prototype = {
    /**
     * Returns the table name of content which is processed
     * @return String
     */
    getTableName: function() {
        return 'sn_ex_sp_quick_link';
    },

    /**
     * Returns true or false whether a user has access to view the quick link record
     * @param String - recordId
     * @param String - userId
     * @param boolean - isMobile
     * @return Boolean
     */
    canView: function(recordId, userId, isMobile) {
        var qlGr = new GlideRecord(this.getTableName());
        if (qlGr.get(recordId)) 
          return new sn_ex_sp.QuickLinkUtil().canRead(qlGr, isMobile);
    },

    /**
     * Returns popularity of content, which is used to order the content while displaying
     * @param String - comma separated knowledge article sys_id's
     * @return Object
     */
    getPopularity: function(articleIds) {
        var contentPopularityMap = {};

        return contentPopularityMap;
    },

    /**
     * Returns true if the quick link passes the specified filter conditions for article authoring experience
	 * @param GlideRecord -  quick link record
     * @return Boolean
     */
    isContentAuthoringAllowed: function(record) {
		return record.canRead();
    },

    type: 'QuickLinkContentProcessorSNC'
};
