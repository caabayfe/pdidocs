var TopicServiceUtilSNC = Class.create();
TopicServiceUtilSNC.prototype = {
    initialize: function() {
        this.SORT_BY_FIELD_ORDER = 'order';
        this.SORT_BY_FIELD_POPULARITY = 'popularity';
    },
    /*
     * Check if article is in user preferred language or Glide system language(fallback)
     */
    isValidArticleLanguage: function(m2mGr) {
        var kbGr = new GlideRecord('kb_knowledge');
        if (kbGr.get(m2mGr.getValue('knowledge'))) {
            var articleLanguage = kbGr.getValue('language');
            var userPreferredLanguage = gs.getSession().getLanguage();
            var systemFallbackLanguage = gs.getProperty('glide.sys.language');

            var validLanguages = [];
            validLanguages.push(userPreferredLanguage);
            validLanguages.push(systemFallbackLanguage);
            if (articleLanguage === userPreferredLanguage)
                return true;
            if (validLanguages.indexOf(articleLanguage) == -1) {
                return false;
            } else if (articleLanguage.equals(systemFallbackLanguage)) {
                if (this.hasTranslatedArticleInUPL(kbGr, userPreferredLanguage, m2mGr.getValue('topic')))
                    return false;
            }
            return true;
        } else {
            return false;
        }
    },
    hasTranslatedArticleInUPL: function(currentGr, language, topicId) {
        var kbGr = new KBContentTranslationUtil().getTranslatedVersionsFromGr(currentGr, language);
        if (kbGr.next() && kbGr.getValue('workflow_state') === 'published' && this.isKBPresentInTopic(kbGr, topicId)) {
            return true;
        }
        return false;
    },
    getTranslatedArticleInSelectedLanguage: function(m2mGr) {
        var kbGr = new GlideRecord('kb_knowledge');

        if (kbGr.get(m2mGr.getValue('knowledge'))) {
            var articleLanguage = kbGr.getValue('language');
            var userPreferredLanguage = gs.getSession().getLanguage();
            var systemFallbackLanguage = gs.getProperty('glide.sys.language');
            var isSystemFallbackLanguageEnabled = gs.getProperty("enable_topic_content_lang_fallback", "true") === "true";
            if (articleLanguage === userPreferredLanguage) {
                return kbGr;
            }
            var kbGrUPL = new KBContentTranslationUtil().getTranslatedVersionsFromGr(kbGr, userPreferredLanguage);
            while (kbGrUPL.next()) {
                if (kbGrUPL.getValue('workflow_state') === 'published' && this.isKBPresentInTopic(kbGrUPL, m2mGr.getValue('topic'))) {
                    return kbGrUPL;
                }
            }
            if (isSystemFallbackLanguageEnabled) {
                if (articleLanguage === systemFallbackLanguage) {
                    return kbGr;
                }
                var kbGrFallback = new KBContentTranslationUtil().getTranslatedVersionsFromGr(kbGr, systemFallbackLanguage);
                if (kbGrFallback.next() && kbGrFallback.getValue('workflow_state') === 'published' && this.isKBPresentInTopic(kbGrFallback, m2mGr.getValue('topic'))) {
                    return kbGrFallback;
                }
            }
            return null;
        } else {
            return null;
        }
    },
    /*
     * Wrapper for getContent function in Topic API
     */
    getContent: function(topicId, includeChildTopics, limit, isMobile, excludeItems, contentConfigIds) {
        return this.filterContentByLanguage(topicId, includeChildTopics, limit, isMobile, excludeItems, contentConfigIds, this.SORT_BY_FIELD_ORDER);
    },
    /*
     * Wrapper for getContentByPopularity function in  Topic API
     */
    getContentByPopularity: function(topicId, includeChildTopics, limit, isMobile, excludeItems, contentConfigIds) {
        return this.filterContentByLanguage(topicId, includeChildTopics, limit, isMobile, excludeItems, contentConfigIds, this.SORT_BY_FIELD_POPULARITY);
    },
    /*
     * Wrapper for getFeaturedContent function 
     */
    getFeaturedContent: function(topicId, featuredContentCount, isMobileApp, filterBy) {
        var taxonomyUtil = new global.TaxonomyPortalUtil();
        var featuredContent = taxonomyUtil.getFeaturedContent(topicId, featuredContentCount, isMobileApp, filterBy);
        if (GlidePluginManager.isActive('com.glideapp.knowledge.i18n2')) {
            return this.filterFeaturedContentByLanguage(featuredContent);
        } else {
            return featuredContent;
        }

    },
    filterContentByLanguage: function(topicId, includeChildTopics, limit, isMobile, excludeItems, contentConfigIds, sortByField) {
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        var topicJs = new sn_taxonomy.Topic(topicId);
        var contentArr = [];
        var translatedArr = [];

        while (translatedArr.length < limit && (contentArr.length === 0 || contentArr.length === limit)) {
            if (sortByField === this.SORT_BY_FIELD_ORDER) {
                contentArr = topicJs.getContent(includeChildTopics, limit, isMobile, excludeItems, contentConfigIds);
            } else {
                contentArr = topicJs.getContentByPopularity(includeChildTopics, limit, isMobile, excludeItems, contentConfigIds);
            }
            if (!contentArr || contentArr.length === 0) {
                break;
            }
            if (!GlidePluginManager.isActive('com.glideapp.knowledge.i18n2') || gs.getProperty('taxonomy.knowledge.translation.tokyo')) {
                return contentArr;
            }

            for (var i = 0; i < contentArr.length; i++) {
                var content = contentArr[i];
                if (content.content_type === KB_CONTENT_TYPE) {
                    var contentGr = new GlideRecord('m2m_connected_content');
                    contentGr.get(content.sys_id);
                    if (contentGr && this.isValidArticleLanguage(contentGr)) {
                        translatedArr.push(content);
                    }
                } else {
                    translatedArr.push(content);
                }
                if (translatedArr.length === limit) {
                    break;
                }
            }

            var sysIdArr = [];
            for (var j = 0; j < contentArr.length; j++) {
                sysIdArr.push(contentArr[j].content);
            }
            excludeItems = excludeItems.concat(sysIdArr);
        }
        return translatedArr;
    },
    filterFeaturedContentByLanguage: function(featuredContent) {
        var translatedArr = [];
        featuredContent.forEach(function(content) {
            if (content.content_table === 'kb_knowledge') {
                var contentGr = new GlideRecord('m2m_connected_content');
                contentGr.get(content.sys_id);
                var kbInSelectedLang = this.getTranslatedArticleInSelectedLanguage(contentGr);
                if (kbInSelectedLang) {
                    var contentFromKb = this.getContentFromKB(kbInSelectedLang, contentGr.getValue('topic'));
                    var find = translatedArr.filter(function(arr) {
                        return arr['sys_id'] == contentFromKb['sys_id'];
                    });
                    if (!(find && find.length > 0)) {
                        translatedArr.push(contentFromKb);
                    }
                }
            } else {
                translatedArr.push(content);
            }
        }, this);
        return translatedArr;
    },
    getContentFromKB: function(kbGr, topic) {
        var contentObj = {};
        var m2mGr = new GlideRecord('m2m_connected_content');
        m2mGr.addQuery('knowledge', kbGr.getUniqueValue());
        m2mGr.addQuery('topic', topic);
        m2mGr.query();
        if (m2mGr.next()) {
            contentObj.sys_id = m2mGr.getUniqueValue();
            contentObj.content_table = 'kb_knowledge';
            contentObj.content = kbGr.getUniqueValue();
            contentObj.topic = topic;
            contentObj.popularity = m2mGr.getValue('popularity');
            return contentObj;
        }
        return null;
    },
    isKBPresentInTopic: function(kbGr, topicId) {
        var contentGr = new GlideRecord('m2m_connected_content');
        contentGr.addQuery('topic', topicId);
        contentGr.addQuery('knowledge', kbGr.getUniqueValue());
        contentGr.query();
        if (contentGr.hasNext()) {
            return true;
        } else {
            return false;
        }
    },

    getTopicsFromSession: function (taxonomyId) {
        var menuItems;
        var session = gs.getSession();
        var userID = gs.getUserID();
        var userLanguage = session.getLanguage();
        var topicMenuItems = session.getClientData('taxonomy_topic_menu_items');
        if (topicMenuItems && topicMenuItems.length)
            menuItems = JSON.parse(topicMenuItems);
        if (menuItems && menuItems.userID === userID && menuItems.language === userLanguage && menuItems.taxonomyId === taxonomyId) {
            return menuItems;
        }
        return null;
    },

    /**
     * Fetches connected content for a topic and processes it into display format
     * @param topicSysId - sys_id of the topic
     * @param limit - maximum number of content items to return (default: 3)
     * @param includeChildTopics - whether to include child topics (default: false)
     * @param isMobile - whether this is for mobile display (default: false)
     * @param excludeItems - array of content items to exclude (default: [])
     * @param contentConfigIds - array of content config IDs to filter by (default: [])
     * @param includeFeatured - whether to include featured content (default: false)
     * @returns {Array} Array of processed content items with title, description, image, url
     */
    getProcessedContentForHelpCenter: function(topicSysId, limit, includeChildTopics, isMobile, excludeItems, contentConfigIds, includeFeatured) {
        var contentArr,
            processedContent = [],
            topicPageUtil = new sn_ex_sp.TopicPageUtil();
        
        limit = limit || 3;
        
        if (includeFeatured) {
            // Fetch featured content first
            var featuredContentCount = parseInt(gs.getProperty("taxonomy.content.featured_content_limit", "5"));
            var featuredContent = this.getFeaturedContent(topicSysId, featuredContentCount, isMobile, null);
            var excludedTopicList = featuredContent.map(function(item) { return item.content; });
            
            // Fetch connected content excluding featured items
            var connectedContentLimit = limit - featuredContent.length;
            if (connectedContentLimit > 0) {
                var connectedContent = [];
                var combinedExcludeList = excludeItems.concat(excludedTopicList);
                connectedContent = this.getContentByPopularity(topicSysId, includeChildTopics, connectedContentLimit, isMobile, combinedExcludeList, contentConfigIds);
            }
            
            // Combine featured and connected content
            contentArr = featuredContent.concat(connectedContent);
        } else {
            contentArr = this.getContentByPopularity(topicSysId, includeChildTopics, limit, isMobile, excludeItems, contentConfigIds);
        }
        
        if (gs.nil(contentArr)) {
            return processedContent;
        }
        
        for (var contentIndex = 0; contentIndex < contentArr.length; contentIndex++) {
            var content = contentArr[contentIndex];
            
            if (gs.nil(content) || gs.nil(content.content_table) || gs.nil(content.content)) {
                continue;
            }

            var contentItem = null;
            
            // Get detailed content information
            if (content.content_table === 'kb_knowledge') {
                var kbGr = new GlideRecord('kb_knowledge');
                if (kbGr.get(content.content) && kbGr.canRead()) {
                    var kbContent = new sn_ex_sp.KBCommonAPI().getKBContent(kbGr);
                    var imageUrl = !gs.nil(kbGr.getDisplayValue('image')) ? 
                        kbGr.getDisplayValue('image') + '?t=small' : 
                        topicPageUtil.fetchDefaultIconImage();
                    
                    contentItem = {
                        name: kbGr.getDisplayValue('short_description') || '',
                        description: !gs.nil(kbContent) ? $sp.stripHTML(kbContent) : '',
                        icon: imageUrl,
                        link: '?id=kb_article&sysparm_article=' + kbGr.getValue('number'),
                        order: content.order,
                        content_table: content.content_table
                    };
                }
            } else if (content.content_table === 'sc_cat_item') {
                var catalogItemJS = new sn_sc.CatItem(content.content);
                var catItemDetails = catalogItemJS.getItemSummary();
                
                if (!gs.nil(catItemDetails)) {
                    var page = content.content_table;
                    var urlSysId = catItemDetails.content_type === 'kb' ? catItemDetails.kb_article : catItemDetails.sys_id;
                    
                    if (catItemDetails.type === 'order_guide') {
                        page = 'sc_cat_item_guide';
                    } else if (catItemDetails.type === 'content_item' && catItemDetails.content_type === 'kb') {
                        page = 'kb_article';
                    }
                    
                    var defaultUrl = '?id=' + page + '&sys_id=' + urlSysId;
                    var finalUrl = catItemDetails.type === 'content_item' && catItemDetails.content_type === 'external' ?
                        catItemDetails.url : defaultUrl;
                    
                    var imageUrl = !gs.nil(catItemDetails.picture) ? catItemDetails.picture + '?t=small' : topicPageUtil.fetchDefaultIconImage();
                    
                    contentItem = {
                        name: catItemDetails.name || '',
                        description: catItemDetails.short_description || '',
                        icon: imageUrl,
                        link: finalUrl || '',
                        order: content.order,
                        content_table: content.content_table
                    };
                }
            }
            else if (content.content_table === 'sn_ex_sp_quick_link') {
                var quickLinkGr = new GlideRecord('sn_ex_sp_quick_link');
                if (quickLinkGr.get(content.content)) {
                    var quickLinkUtil = new sn_ex_sp.QuickLinkUtil();
                    var quicklinkDetails = quickLinkUtil.convert(quickLinkGr, content.order);
                    
                    if (!gs.nil(quicklinkDetails)) {
                        contentItem = {
                            name: quicklinkDetails.title || '',
                            description: quicklinkDetails.shortDescription || '',
                            icon: quicklinkDetails.icon || topicPageUtil.fetchDefaultIconImage(),
                            link: quicklinkDetails.url || '',
                            order: content.order,
                            content_table: content.content_table
                        };
                    }
                }
            }
            
            if (!gs.nil(contentItem)) {
                processedContent.push(contentItem);
            }
        }
        
        return processedContent;
    },
    type: 'TopicServiceUtilSNC'
};
