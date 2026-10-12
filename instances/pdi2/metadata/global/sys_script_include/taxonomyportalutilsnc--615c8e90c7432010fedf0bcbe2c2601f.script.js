var TaxonomyPortalUtilSNC = Class.create();
TaxonomyPortalUtilSNC.prototype = {
    initialize: function() {
        this.contentReferenceFields = TaxonomyConstants.CONTENT_REFERENCE_FIELDS;
        this.tables = TaxonomyConstants.TABLES;
    },

    /**
     * Returns the featured content associated to a topic
     * @param topicId - sys_id of topic
     * @param limit - limit on number of featured content required
     * @param contentConfigId - (Optional parameter) will filter out everything except the featured content with given contentConfigId
     * return an array of JSON objects of connected content records featured at the given topic
     */
    getFeaturedContent: function(topicId, limit, isMobile, contentConfigId) {
        var result = [];
        var topicGr = new GlideRecord(this.tables.TOPIC_TABLE);
        topicGr.get(topicId);
        if (!topicGr.isValidRecord()) {
            gs.error(gs.getMessage("There is no topic with given sys_id: {0}", [topicId]));
            return [];
        }
        if (!topicGr.active) {
            gs.info(gs.getMessage("{0} topic is not active", [topicGr.name]));
            return [];
        }

        if (!gs.nil(contentConfigId)) {
            var gr = new GlideRecord(this.tables.TAXONOMY_CONTENT_CONFIGURATION);
            gr.addQuery('sys_id', contentConfigId);
            gr.query();
            if (!gr.hasNext())
                contentConfigId = "";
        }
        if (gs.nil(isMobile))
            isMobile = false;

        var featGr = this.prepareFeaturedContentQuery(topicId);
        featGr.query();

        var m2mContentIds = [];
        while (featGr.next())
            m2mContentIds.push(featGr.getValue('connected_content'));

        var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";
        if (versioningEnabled)
            this.replaceOutdatedArticlesConnectedContent(m2mContentIds);
        var contentConfigUtil = new ContentConfigUtil();
        var contentConfigGr = contentConfigUtil.getContentConfigGrFromId(contentConfigId);
        if (contentConfigGr.getRowCount() == 0)
            return result;
        var taxonomyUtil = new TaxonomyUtil();
        var combinedFilter = taxonomyUtil.getCombinedContentFilter(contentConfigGr);
        var m2mContentGr = this.prepareContentQuery(combinedFilter, contentConfigId);
        m2mContentGr.addQuery('sys_id', m2mContentIds);
        m2mContentGr.orderBy('order');
        m2mContentGr.query();
        result = this.getConnectedContentObjList(m2mContentGr, m2mContentIds, limit, isMobile);
        return result;
    },


    /**
     * replaces the connected content id containing outdated knowledge articles with connected content ids containing published knowledge articles
     * @param m2mContentIds - original array of connected content
     */
    replaceOutdatedArticlesConnectedContent: function(m2mContentIds) {
        var outdatedGr = new GlideRecord(this.tables.M2M_CONTENT_TABLE);
        outdatedGr.addQuery('sys_id', m2mContentIds);
        outdatedGr.addNotNullQuery('knowledge');
        outdatedGr.addQuery('knowledge.workflow_state', '!=', 'published');
        outdatedGr.query();
        while (outdatedGr.next()) {
            var publlishedConnectedContentId = this.getConnectedContentForPublishedArticle(outdatedGr.topic, outdatedGr.knowledge.number);
            if (!gs.nil(publlishedConnectedContentId))
                m2mContentIds.splice(m2mContentIds.indexOf(outdatedGr.getUniqueValue()), 1, publlishedConnectedContentId);
        }
    },

    /**
     * returns the connected content with published version of a knowledge article for a given article number
     * @param topicId
     * @param articleNumber
     */
    getConnectedContentForPublishedArticle: function(topicId, articleNumber) {
        var latestGr = new GlideRecord(this.tables.M2M_CONTENT_TABLE);
        latestGr.addQuery('topic', topicId);
        latestGr.addNotNullQuery('knowledge');
        latestGr.addQuery('knowledge.number', articleNumber);
        latestGr.addQuery('knowledge.workflow_state', 'published');
        latestGr.setLimit(1);
        latestGr.query();
        if (latestGr.next())
            return latestGr.getUniqueValue();
        return "";
    },

    /**
     * create a glideRecord query on featured content for a given topicId
     * @param topicId
     */
    prepareFeaturedContentQuery: function(topicId) {
        var featGr = new GlideRecord(this.tables.FEATURED_CONTENT_TABLE);
        featGr.addQuery('topic', topicId);
        featGr.orderBy('order');
        return featGr;
    },

    /**
    * apply the combined filter and contentConfigId filter(if provided)
    * @param combinedFilter - from this.getCombinedContentFilter
    @ @param contentConfigId
    */
    prepareContentQuery: function(combinedFilter, contentConfigId) {
        var gr = new GlideRecord(this.tables.M2M_CONTENT_TABLE);
        if (!gs.nil(contentConfigId))
            gr.addQuery('content_type', contentConfigId);
        if (!gs.nil(combinedFilter))
            gr.addEncodedQuery(combinedFilter);
        return gr;
    },

    /**
     * return an array of objects containing connected content fields for accessible connected content records
     * @param m2mContentGr
     */
    getConnectedContentObjList: function(m2mContentGr, m2mContentIds, limit, isMobile) {
        var result = [];
        var count = 0;
        var contentIdToContent = []; //Used for sorting the content according to featured content order (Mapping from connectedContentID to topicContent object).
        for (var i = 0; i < m2mContentIds.length; i++) {
            contentIdToContent[m2mContentIds[i]] = null;
        }
        var taxonomyUtil = new TaxonomyUtil();
        var tableToContentProcessorMap = taxonomyUtil.getTableToContentProcessorMap();
        while (m2mContentGr.next()) {
            var sys_id = m2mContentGr.getUniqueValue();
            var contentTable = m2mContentGr.content_type.content_table.toString();
            var refField = m2mContentGr.content_type.content_reference_field;
            var content = m2mContentGr.getValue(refField);
            var topic = m2mContentGr.getValue('topic');
            var popularity = m2mContentGr.getValue('popularity');

            var topicContent = {
                'sys_id': sys_id,
                'content_table': contentTable,
                'content': content,
                'topic': topic,
                'popularity': popularity
            };
            var contentProcessor = tableToContentProcessorMap[contentTable];
            if (contentProcessor.canView(content, gs.getUserID(), isMobile)) {
                contentIdToContent[sys_id] = topicContent;
            }
        }
        for (var id in contentIdToContent) {
            if (count == limit) return result;
            if (contentIdToContent[id]) {
                result.push(contentIdToContent[id]);
                count++;
            }
        }
        return result;
    },

    /**
    * Creates or updates the taxonomy association for a given portal
    * @param portalSysId - sys_id of the portal
    * @param taxonomySysId - sys_id of the taxonomy to associate
    * @return true if successfully created or updated, else false
    */
    setPortalTaxonomy: function(portalSysId, taxonomySysId) {
        if (gs.nil(portalSysId) || gs.nil(taxonomySysId)) {
            gs.error(gs.getMessage("Portal sys_id and taxonomy sys_id are required"));
            return false;
        }
        var portalTaxonomyGr = new GlideRecord(this.tables.M2M_PORTAL_TAXONOMY_TABLE);
        portalTaxonomyGr.addQuery('sp_portal', portalSysId);
        portalTaxonomyGr.query();
        
        if (portalTaxonomyGr.next()) {
            portalTaxonomyGr.setValue('taxonomy', taxonomySysId);
            portalTaxonomyGr.update();
            gs.info(gs.getMessage("Updated taxonomy for portal {0} to {1}", [portalSysId, taxonomySysId]));
            return true;
        }
        portalTaxonomyGr.initialize();
        portalTaxonomyGr.setValue('sp_portal', portalSysId);
        portalTaxonomyGr.setValue('taxonomy', taxonomySysId);
        var newSysId = portalTaxonomyGr.insert();
        
        if (!gs.nil(newSysId)) {
            gs.info(gs.getMessage("Created taxonomy association for portal {0} with taxonomy {1}", [portalSysId, taxonomySysId]));
            return true;
        }
        return false;
    },

    type: 'TaxonomyPortalUtilSNC'
};
