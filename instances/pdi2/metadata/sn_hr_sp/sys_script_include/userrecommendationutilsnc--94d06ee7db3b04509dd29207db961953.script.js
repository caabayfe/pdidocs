var UserRecommendationUtilSNC = Class.create();
UserRecommendationUtilSNC.prototype = {
    initialize: function(instanceId, statsParentId) {
        this.stats = {};
        this.stats.callerId = instanceId;
        this.stats.callerTable = instanceId ? 'sp_instance' : '';
        this.stats.parentId = statsParentId;
        this.stats.textPrefix = 'UserRecommendationUtil';
        this.stats.userId = gs.getUserID();
        this.performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();
    },

    getKbGrFromSysId: function(articleId) {
        var gr = new GlideRecord("kb_knowledge");
        gr.get(articleId);
        return gr;
    },

    getRecentActivityPropertyConfigured: function() {
        var isRecentActivityPropertyConfigured = !gs.nil(gs.getProperty('recent.activity.cutoff.days'));
        return isRecentActivityPropertyConfigured;
    },


    /* getMostViewedArticles: Gets the most viewed articles based on view count of the articles
    Parameters : 1)knowledgeBases : List of knowledge bases that are accessible for the portal in which the widget is placed 
                2)kbRecord : Article Record 
                3)articleCount : The number of articles to be returned 
                4)ignoreArticles : The list of articles to ignore. In User profile Recommendation if one result is fetched from ML, the other two are fetched from this method. In this case the ignore articles contains the sys_id of the article that is already been fetched from ML
*/

    getMostViewedArticles: function(articlePayload) {
        var isRecentActivityPropertyConfigured = this.getRecentActivityPropertyConfigured();
        if(isRecentActivityPropertyConfigured) {
            return this.getAllArticlesFromConnectedContent(articlePayload);
        }
        var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";

        var isKnowledgeTranslationPluginActive = GlidePluginManager.isActive('com.glideapp.knowledge.i18n2');
        var preferredLanguage = gs.getSession().getLanguage();
        var fallBackLanguage = gs.getProperty('glide.sys.language');
        var isSystemFallbackLanguageEnabled = gs.getProperty("enable_topic_content_lang_fallback", "true") === "true";
        var isPreferredLanguageDifferentFromFallback = preferredLanguage != fallBackLanguage;
        var accessibleKbs = new sn_ex_sp.TopicSecurityUtil().fetchKnowledgeBaseFromSession();

        var count = 0;
        var articles = [];
        var articleDetails = {};
        if (!gs.nil(articlePayload.ignoreArticles))
            articlePayload.kbRecords.addQuery('sys_id', 'NOT IN', articlePayload.ignoreArticles);
        if (!gs.nil(articlePayload.taxonomyId)) {
            articlePayload.kbRecords.addQuery('taxonomy_topic.taxonomy', articlePayload.taxonomyId);
        }
        articlePayload.kbRecords.addQuery('kb_knowledge_base', 'IN', accessibleKbs);
        articlePayload.kbRecords.addQuery('sys_view_count', '>', '0');

        if (isKnowledgeTranslationPluginActive) {
            if (isPreferredLanguageDifferentFromFallback && isSystemFallbackLanguageEnabled) {
                var fallbackGr = new GlideRecord(articlePayload.kbRecords.getTableName());
                fallbackGr.addEncodedQuery(articlePayload.kbRecords.getEncodedQuery());
            }
            articlePayload.kbRecords.addQuery('language', preferredLanguage);
        }

        articlePayload.kbRecords.orderByDesc('sys_view_count');
        articlePayload.kbRecords.query();
        while (articlePayload.kbRecords.next() && count < articlePayload.articleCount) {
            this.stats.startTime = new GlideDateTime();
            articleDetails = {};
            articleDetails = this.checkAndReturnAccessibleArticle(articlePayload.kbRecords.sys_id, articlePayload.knowledgeBases, versioningEnabled, articlePayload.taxonomyId);
            if (!gs.nil(articleDetails) && !this.isArticleDuplicate(articles, articleDetails, articlePayload.ignoreArticles)) {
                ++count;
                articleDetails.score = articlePayload.kbRecords.getValue('sys_view_count');
                articleDetails.category = 'article';
                articleDetails.isPreferredLanguage = true;
                articles.push(articleDetails);
            }
            this.stats.refTable = articlePayload.kbRecords.getTableName();
            this.stats.refRecordId = articlePayload.kbRecords.sys_id;
            this.stats.shortDesc = 'Get Most Viewed Articles';
            this.performanceIndicatorUtil.postHotspot(this.stats);
        }

        if (count < articlePayload.articleCount && isKnowledgeTranslationPluginActive && isPreferredLanguageDifferentFromFallback && isSystemFallbackLanguageEnabled) {
            var consideredArticleIds = [];
            articles.forEach(function(articleDetail) {
                var translatedArticleId = this.getArticleInSpecifiedLanguage(this.getKbGrFromSysId(articleDetail.sys_id), fallBackLanguage);
                if (translatedArticleId)
                    consideredArticleIds.push(translatedArticleId);
            }, this);
            fallbackGr.addQuery('language', fallBackLanguage);
            fallbackGr.addQuery('sys_id', 'NOT IN', consideredArticleIds);
            fallbackGr.orderByDesc('sys_view_count');
            fallbackGr.query();
            while (fallbackGr.next() && count < articlePayload.articleCount) {
                this.stats.startTime = new GlideDateTime();
                articleDetails = this.checkAndReturnAccessibleArticle(fallbackGr.sys_id, articlePayload.knowledgeBases, versioningEnabled, articlePayload.taxonomyId);
                if (!gs.nil(articleDetails) && !this.isArticleDuplicate(articles, articleDetails, articlePayload.ignoreArticles)) {
                    ++count;
                    articleDetails.score = fallbackGr.getValue('sys_view_count');
                    articleDetails.category = 'article';
                    articleDetails.isPreferredLanguage = false;
                    articles.push(articleDetails);
                }
                this.stats.refTable = articlePayload.kbRecords.getTableName();
                this.stats.refRecordId = fallbackGr.getUniqueValue();
                this.stats.shortDesc = 'Get Most Viewed Articles fallback kb';
                this.performanceIndicatorUtil.postHotspot(this.stats);
            }
        }

        return articles;
    },

    /* getArticlesforSimilarUsers : Gets the most viewed Articles of all the similar users based on the article usage recorded in kb_use table 
    Parameters: 1)users: List of similar users 
                2)knolwdgeBases : List of knowledge bases that are accessible for the portal in which the widget is placed 
                3)articleCount : Number of articles to be returned
    */
    getArticlesforSimilarUsers: function(dataPayload) {
        var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";

        var isKnowledgeTranslationPluginActive = GlidePluginManager.isActive('com.glideapp.knowledge.i18n2');
        var preferredLanguage = gs.getSession().getLanguage();
        var fallBackLanguage = gs.getProperty('glide.sys.language');
        var isSystemFallbackLanguageEnabled = gs.getProperty("enable_topic_content_lang_fallback", "true") === "true";
        var isPreferredLanguageDifferentFromFallback = preferredLanguage != fallBackLanguage;
        var accessibleKbs = new sn_ex_sp.TopicSecurityUtil().fetchKnowledgeBaseFromSession();

        var count = 0;
        var articles = [];
        var articleDetails = {};
        var kbUse = new GlideAggregate('kb_use');
        kbUse.addQuery('user', 'IN', dataPayload.users);
        kbUse.addQuery('article.kb_knowledge_base', 'IN', accessibleKbs);
        if (!gs.nil(dataPayload.recentActivityCutoffDate))
            kbUse.addQuery('sys_created_on', '>=', dataPayload.recentActivityCutoffDate);

        if (isKnowledgeTranslationPluginActive) {
            if (isPreferredLanguageDifferentFromFallback && isSystemFallbackLanguageEnabled) {
                var fallBackKbUse = new GlideAggregate(kbUse.getTableName());
                fallBackKbUse.addEncodedQuery(kbUse.getEncodedQuery());
            }
            kbUse.addQuery('article.language', preferredLanguage);
        }

        kbUse.addAggregate('COUNT', 'article');
        kbUse.orderByAggregate('COUNT', 'article');
        kbUse.query();
        while (kbUse.next() && count < dataPayload.articleCount) {
            this.stats.startTime = new GlideDateTime();
            articleDetails = {};
            articleDetails = this.checkAndReturnAccessibleArticle(kbUse.article, dataPayload.knowledgeBases, versioningEnabled, dataPayload.taxonomyId);
            if (!gs.nil(articleDetails) && !this.isArticleDuplicate(articles, articleDetails)) {
                ++count;
                articleDetails.score = kbUse.getAggregate('COUNT', 'article');
                articleDetails.category = 'article';
                articleDetails.isPreferredLanguage = true;
                articles.push(articleDetails);
            }
            this.stats.refTable = 'kb_use';
            this.stats.refRecordId = kbUse.getUniqueValue();
            this.stats.shortDesc = 'Get Articles for Similar Users';
            this.performanceIndicatorUtil.postHotspot(this.stats);
        }

        if (count < dataPayload.articleCount && isKnowledgeTranslationPluginActive && isSystemFallbackLanguageEnabled && isPreferredLanguageDifferentFromFallback) {
            var consideredArticleIds = [];
            articles.forEach(function(articleDetail) {
                var translatedArticleId = this.getArticleInSpecifiedLanguage(this.getKbGrFromSysId(articleDetail.sys_id), fallBackLanguage);
                if (translatedArticleId)
                    consideredArticleIds.push(translatedArticleId);
            }, this);

            fallBackKbUse.addQuery('article.language', fallBackLanguage);
            fallBackKbUse.addQuery('article', 'NOT IN', consideredArticleIds);
            fallBackKbUse.addAggregate('COUNT', 'article');
            fallBackKbUse.orderByAggregate('COUNT', 'article');
            fallBackKbUse.query();
            while (fallBackKbUse.next() && count < dataPayload.articleCount) {
                articleDetails = this.checkAndReturnAccessibleArticle(fallBackKbUse.getValue('article'), dataPayload.knowledgeBases, versioningEnabled, dataPayload.taxonomyId);
                if (!gs.nil(articleDetails) && !this.isArticleDuplicate(articles, articleDetails)) {
                    ++count;
                    articleDetails.score = fallBackKbUse.getAggregate('COUNT', 'article');
                    articleDetails.category = 'article';
                    articleDetails.isPreferredLanguage = false;
                    articles.push(articleDetails);
                }
                this.stats.refTable = 'kb_use';
                this.stats.refRecordId = fallBackKbUse.getUniqueValue();
                this.stats.shortDesc = 'Get fallback Articles for Similar Users';
                this.performanceIndicatorUtil.postHotspot(this.stats);
            }
        }

        return articles;
    },

    /* checkAndReturnAccessibleArticle : Checks if the current user can access the article and returns the article details sysId and short_description
    Parmeters : 1) articleId : sysId of the article
                2) knolwdgeBases: List of knowledge bases that are accessible for the portal in which the widget is placed 
                3) versioningEnabled : True if com.snc.knowledge_advanced is intalled and also if glide.knowman.versioning.enabled property is true, to get the latest article if versioning is enabled
    */

    checkAndReturnAccessibleArticle: function(articleId, knowledgeBases, versioningEnabled, taxonomyId) {
        var article = {};

        var articleGr = new GlideRecord('kb_knowledge');
        if (!gs.nil(taxonomyId)) articleGr.addQuery('taxonomy_topic.taxonomy', taxonomyId);
        articleGr.addQuery('sys_id', articleId);
        new global.KBKnowledge().addKnowledgeQueries(articleGr, knowledgeBases, true);
        articleGr.addQuery('workflow_state', 'IN', 'outdated,published');
        articleGr.query();
        if (articleGr.next() && articleGr.canRead()) {
            if (versioningEnabled && articleGr.workflow_state != 'published') {
                var grsKbLatest = new GlideRecord("kb_knowledge");
                new global.KBKnowledge().addKnowledgeQueries(grsKbLatest, knowledgeBases, true);
                grsKbLatest.addQuery('article_id', articleGr.article_id);
                grsKbLatest.addQuery('workflow_state', 'published');
                grsKbLatest.addQuery("sys_created_on", ">=", articleGr.sys_created_on);
                grsKbLatest.orderByDesc('sys_created_on');
                grsKbLatest.setLimit(1);
                grsKbLatest.query();
                if (grsKbLatest.next() && grsKbLatest.canRead()) {
                    article.short_description = grsKbLatest.getValue('short_description');
                    article.description = grsKbLatest.getValue('description');
                    article.sys_created_on = grsKbLatest.getValue('sys_created_on');
                    article.sys_updated_on = grsKbLatest.getValue('sys_updated_on');
                    article.meta_description = grsKbLatest.getValue('meta_description');
                    article.sys_id = grsKbLatest.getValue('sys_id');
                } else
                    return null;

            } else {
                article.short_description = articleGr.getValue('short_description');
                article.description = articleGr.getValue('description');
                article.sys_id = articleGr.getValue('sys_id');
                article.sys_created_on = articleGr.getValue('sys_created_on');
                article.sys_updated_on = articleGr.getValue('sys_updated_on');
                article.meta_description = articleGr.getValue('meta_description');
            }
            return article;
        } else
            return null;
    },

    /*getCatalogItems : Gets the list of most submmited catalog Items 
    Parameters : 1) users : List of similar users for the logged in users. If the list is not empty , only the catalog items submitted by the similar users are returned. If the list is empty catalog items submitted by all users are considered
                2) catalogs : List of catalogs that are supported by the portal in which the widget is displayed
                3) catalogCount : Number of catalog Items to be returned 
                4)ignoredCatalogs : The list of catalog items to ignore. In User Recommendation if one result is fetched from ML based on similar users, the other two are fetched from this method without considering similar users. In this case the ignore catalogs contains the sys_id of the catalog that is already been fetched from ML
    */
    getCatalogItems: function(catalogData) {
        var catItemArray = [];
        var isRecentActivityPropertyConfigured = this.getRecentActivityPropertyConfigured();
        // if there is no taxonomy assosiated then do not use m2m_connected_content
        if (!gs.nil(catalogData.users) || (!isRecentActivityPropertyConfigured && !gs.nil(catalogData.recentActivityCutoffDate))) {
            var portalCatalogs = [];
            if (gs.nil(catalogData.taxonomyId)) {
                portalCatalogs = $sp ? $sp.getCatalogs().value.split(',') : [];
            }
            var reqItems = this.getRequestItems(catalogData.users, catalogData.ignoredCatalogs, catalogData.catalogCount, catalogData.recentActivityCutoffDate, catalogData.taxonomyId, portalCatalogs);
            var recordProducers = this.getRecordProducers(catalogData.users, catalogData.ignoredCatalogs, catalogData.catalogCount, catalogData.recentActivityCutoffDate, catalogData.taxonomyId, portalCatalogs);
            var finalList = reqItems.concat(recordProducers);
            finalList.sort(this._sortCatalog);
            return finalList.slice(0, catalogData.catalogCount);
        } else {
            //get content from m2m table when ml/similar users not present, and recent activity cutoff date is not mentioned(configurable).(mobile scenario)
            var allCatItems = this.getAllCatalogsFromConnectedContent(catalogData.ignoredCatalogs, catalogData.catalogCount, catalogData.taxonomyId);
            allCatItems.sort(this._sortCatalog);
            return allCatItems.slice(0, catalogData.catalogCount);
        }

    },

    /*getRequestItems : Gets the list of catalog items submitted from sc_req_item table , which records the catalog items submitted by a user.Here in order to distinguish between each submission of catalog Item , the results are grouped based on Requested For and Catalog Item. 
    Parameters : 1) users : List of similar users for the logged in users. If the list is not empty , only the catalog items submitted by the similar users are returned. If the list is empty catalog items submitted by all users are considered
                2)ignoredCatalogs : The list of catalog items to ignore.In User Recommendation if one result is fetched from ML based on similar users, the other two are fetched from this method without considering similar users. In this case the ignoreCatalogs contains the sys_id of the catalog that is already been fetched from ML
    */
    getRequestItems: function(users, ignoredCatalogs, catalogCount, recentActivityCutoffDate, taxonomyId, portalCatalogs) {
        var count = 0;
        var result = [];
        var catItem = {};


        var reqItems = new GlideAggregate('sc_req_item');
        reqItems.setCategory("catalog_meta");
        if (!gs.nil(users))
            reqItems.addQuery('request.requested_for', 'IN', users);
        if (!gs.nil(ignoredCatalogs))
            reqItems.addQuery('cat_item', 'NOT IN', ignoredCatalogs);
        /*Order guides are fetched seperately in getOrderGuides function */
        reqItems.addNullQuery('order_guide');
        if (!gs.nil(taxonomyId)) {
			reqItems.addQuery('cat_item.taxonomy_topic.taxonomy', taxonomyId);
            reqItems.addQuery('cat_item.taxonomy_topic.active', true);
		} else if (portalCatalogs && portalCatalogs.length > 0) {
            var catalogsQuery = '';
            portalCatalogs.forEach(function(catalog) {
                catalogsQuery = catalogsQuery + (catalogsQuery ? '^OR' : '') + 'cat_item.sc_catalogsCONTAINS' + catalog;
            });
            reqItems.addEncodedQuery(catalogsQuery);
        }
		reqItems.addQuery('cat_item.active', true);
        reqItems.addQuery('cat_item.visible_standalone', 'true');
        reqItems.addEncodedQuery('cat_item.hide_sp=false^ORcat_item.hide_spISEMPTY');
        reqItems.addQuery('sys_created_on', '>=', recentActivityCutoffDate);
        reqItems.addAggregate('COUNT', 'cat_item');
        reqItems.orderByAggregate('COUNT', 'cat_item');
        reqItems.query();
        while (reqItems.next() && count < catalogCount) {
            this.stats.startTime = new GlideDateTime();

            catItem = {};
            catItem.sys_id = reqItems.getValue('cat_item');
            catItem.count = reqItems.getAggregate('COUNT', 'cat_item');
            catItem.score = parseInt(catItem.count);
            catItem.category = "catalog";

            this.stats.refTable = 'sc_req_item';
            this.stats.refRecordId = reqItems.getUniqueValue();
            this.stats.shortDesc = 'GetRequestItems - '.concat(catItem.sys_id);
            this.performanceIndicatorUtil.postHotspot(this.stats);

            var catalogItemJS = new sn_sc.CatItem(catItem.sys_id);
            if (!GlideappCatalogItem.get(catItem.sys_id).canView() || !catalogItemJS.canView(gs.isMobile()) || !catalogItemJS.isVisibleServicePortal())
                continue;
            var catalogItemDetails = catalogItemJS.getItemSummary(true, "basic");
            catItem.short_description = catalogItemDetails.short_description;
            catItem.name = catalogItemDetails.name;
            catItem.href = "?id=sc_cat_item&sys_id=" + catalogItemDetails.sys_id;
            catItem.icon = catalogItemDetails.icon;
            catItem.image = catalogItemDetails.picture;

            catItem.price = this.checkItemPrice(reqItems.cat_item);
            var recurring_frequency = reqItems.cat_item.recurring_frequency;
            var recurring_price = reqItems.cat_item.recurring_price.getDisplayValue();
            var zeroRecurringPriceVal = '0.00';
            var isRecurringPriceNonZero = recurring_price && recurring_price.substr(1, 4) !== zeroRecurringPriceVal;
            if (recurring_frequency && isRecurringPriceNonZero)
                catItem.price = catItem.price + ' + ' + recurring_price + '/' + recurring_frequency;

            result.push(catItem);
            ++count;
        }
        return result;
    },

    /*getRecordProducers: Gets the list of Record Producers submitted from sc_item_produced_record , which records the record producer submitted by a user.Here in order to distinguish between each submission of Record Producer ,the results are grouped based on Created by and Producer.  
    Parameters : 1) users : List of similar users for the logged in users. If the list is not empty , only the catalog items submitted by the similar users are returned. If the list is empty catalog items submitted by all users are considered
                2)ignoredCatalogs : The list of catalog items to ignore. In User Recommendation if one result is fetched from ML based on similar users, the other two are fetched from this method without considering similar users. In this case the ignoreCatalogs contains the sys_id of the catalog that is already been fetched from ML
    */

    getRecordProducers: function(users, ignoredCatalogs, catalogCount, recentActivityCutoffDate, taxonomyId, portalCatalogs) {
        var count = 0;
        var producer = {};
        var result = [];
        var userId = [];

        var reqItems = new GlideAggregate('sc_item_produced_record');
        reqItems.setCategory("catalog_meta");
        if (!gs.nil(taxonomyId)) {
            reqItems.addQuery('producer.taxonomy_topic.taxonomy', taxonomyId);
            reqItems.addQuery('producer.taxonomy_topic.active', true);

        } else if (portalCatalogs && portalCatalogs.length > 0) {
            var catalogsQuery = '';
            portalCatalogs.forEach(function(catalog) {
                catalogsQuery = catalogsQuery + (catalogsQuery ? '^OR' : '') + 'producer.sc_catalogsCONTAINS' + catalog;
            });
            reqItems.addEncodedQuery(catalogsQuery);
        }
        if (!gs.nil(users))
            reqItems.addQuery('task.opened_by', 'IN', users);
        if (!gs.nil(ignoredCatalogs))
            reqItems.addQuery('producer', 'NOT IN', ignoredCatalogs);
        reqItems.addQuery('producer.active', true);
        reqItems.addQuery('sys_created_on', '>=', recentActivityCutoffDate);
        reqItems.addQuery('producer.visible_standalone', 'true');
        reqItems.addEncodedQuery('producer.hide_sp=false^ORproducer.hide_spISEMPTY');
        reqItems.addAggregate('COUNT', 'producer');
        reqItems.orderByAggregate('COUNT', 'producer');
        reqItems.query();
        while (reqItems.next() && count < catalogCount) {
            this.stats.startTime = new GlideDateTime();

            producer = {};
            producer.sys_id = reqItems.getValue('producer');
            producer.count = reqItems.getAggregate('COUNT', 'producer');
            producer.score = parseInt(producer.count);
            producer.category = "catalog";

            this.stats.refTable = 'sc_item_produced_record';
            this.stats.refRecordId = reqItems.getUniqueValue();
            this.stats.shortDesc = 'GetRecordProducers - '.concat(producer.sys_id);
            this.performanceIndicatorUtil.postHotspot(this.stats);

            var catalogItemJS = new sn_sc.CatItem(producer.sys_id);
            if (!GlideappCatalogItem.get(producer.sys_id).canView() || !catalogItemJS.canView(gs.isMobile()) || !catalogItemJS.isVisibleServicePortal())
                continue;
            var catalogItemDetails = catalogItemJS.getItemSummary(true, "basic");
            producer.short_description = catalogItemDetails.short_description;
            producer.name = catalogItemDetails.name;
            producer.href = "?id=sc_cat_item&sys_id=" + catalogItemDetails.sys_id;
            producer.icon = catalogItemDetails.icon;
            producer.image = catalogItemDetails.picture;

            producer.price = this.checkItemPrice(reqItems.producer);
            var recurring_frequency = reqItems.producer.recurring_frequency;
            var recurring_price = reqItems.producer.recurring_price.getDisplayValue();
            var zeroRecurringPriceVal = '0.00';
            var isRecurringPriceNonZero = recurring_price && recurring_price.substr(1, 4) !== zeroRecurringPriceVal;
            if (recurring_frequency && isRecurringPriceNonZero)
                producer.price = producer.price + ' + ' + recurring_price + '/' + recurring_frequency;

            result.push(producer);
            ++count;
        }
        return result;
    },

    getAllCatalogsFromConnectedContent: function(ignoredCatalogs, catalogCount, taxonomyId) {
        var producer = {};
        var result = [];
        var m2mGr = new GlideAggregate('m2m_connected_content');
        m2mGr.addQuery('topic.taxonomy', taxonomyId);
        m2mGr.addQuery('topic.active', true);
        m2mGr.addQuery('content_type', '98f9a16553622010069addeeff7b1248');
        if (!gs.nil(ignoredCatalogs))
            m2mGr.addQuery('catalog_item', 'NOT IN', ignoredCatalogs);
        m2mGr.addAggregate('COUNT', 'catalog_item');
        m2mGr.orderByDesc('popularity');
        m2mGr.orderBy('catalog_item');
        m2mGr.orderBy('catalog_item.name');
        m2mGr.setLimit(catalogCount);
        m2mGr.query();
        while (m2mGr.next()) {
            this.stats.startTime = new GlideDateTime();

            producer = {};
            producer.sys_id = m2mGr.getValue('catalog_item');
            producer.count = m2mGr.popularity;
            producer.score = parseInt(m2mGr.popularity);
            producer.category = "catalog";

            this.stats.refTable = 'm2m_connected_content';
            this.stats.refRecordId = m2mGr.getUniqueValue();
            this.stats.shortDesc = 'GetAllCatalogsFromConnectedContent - '.concat(producer.sys_id);
            this.performanceIndicatorUtil.postHotspot(this.stats);

            var catalogItemJSM2M = new sn_sc.CatItem(producer.sys_id);
            if (!GlideappCatalogItem.get(producer.sys_id).canView() || !catalogItemJSM2M.canView(gs.isMobile()) || !catalogItemJSM2M.isVisibleServicePortal())
                continue;
            var catalogItemDetailsM2M = catalogItemJSM2M.getItemSummary(true, "basic");
            producer.short_description = catalogItemDetailsM2M.short_description;
            producer.name = catalogItemDetailsM2M.name;
            producer.href = "?id=sc_cat_item&sys_id=" + catalogItemDetailsM2M.sys_id;
            producer.icon = catalogItemDetailsM2M.icon;
            producer.image = catalogItemDetailsM2M.picture;
            producer.price = this.checkItemPrice(m2mGr.catalog_item);

            var recurring_frequency = m2mGr.catalog_item.recurring_frequency;
            var recurring_price = m2mGr.catalog_item.recurring_price.getDisplayValue();
            var zeroRecurringPriceVal = '0.00';
            var isRecurringPriceNonZero = recurring_price && recurring_price.substr(1, 4) !== zeroRecurringPriceVal;
            if (recurring_frequency && isRecurringPriceNonZero)
                producer.price = producer.price + ' + ' + recurring_price + '/' + recurring_frequency;

            result.push(producer);
        }
        return result;
    },

    getAllArticlesFromConnectedContent: function(articlePayload) {
        var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";

        var isKnowledgeTranslationPluginActive = GlidePluginManager.isActive('com.glideapp.knowledge.i18n2');
        var preferredLanguage = gs.getSession().getLanguage();
        var fallBackLanguage = gs.getProperty('glide.sys.language');
        var isSystemFallbackLanguageEnabled = gs.getProperty("enable_topic_content_lang_fallback", "true") === "true";
        var isPreferredLanguageDifferentFromFallback = preferredLanguage != fallBackLanguage;
        var accessibleKbs = new sn_ex_sp.TopicSecurityUtil().fetchKnowledgeBaseFromSession();

        var count = 0;
        var articles = [];
        var articleDetails = {};
        var m2mGr = new GlideAggregate('m2m_connected_content');
        if (!gs.nil(articlePayload.taxonomyId)) {
            m2mGr.addQuery('topic.taxonomy', articlePayload.taxonomyId);
        }
        m2mGr.addQuery('topic.active', true);
        m2mGr.addQuery('content_type', '4c32a92153622010069addeeff7b12a3');
        if (!gs.nil(articlePayload.ignoreArticles))
            m2mGr.addQuery('knowledge.sys_id', 'NOT IN', articlePayload.ignoreArticles);
        m2mGr.addQuery('knowledge.kb_knowledge_base', 'IN', accessibleKbs);
        m2mGr.groupBy('knowledge');
        m2mGr.addAggregate('AVG', 'popularity');
        m2mGr.orderByAggregate('AVG', 'popularity');

        if (isKnowledgeTranslationPluginActive) {
            var articleEncodedQuery = m2mGr.getEncodedQuery();
            m2mGr.addQuery('knowledge.language', preferredLanguage);
        }

        m2mGr.query();
        while (m2mGr.next() && count < articlePayload.articleCount) {
            this.stats.startTime = new GlideDateTime();
            articleDetails = {};
            articleDetails = this.checkAndReturnAccessibleArticle(m2mGr.getValue('knowledge'), articlePayload.knowledgeBases, versioningEnabled, articlePayload.taxonomyId);
            if (!gs.nil(articleDetails) && !this.isArticleDuplicate(articles, articleDetails, articlePayload.ignoreArticles)) {
                ++count;
                articleDetails.score = m2mGr.getAggregate('AVG', 'popularity');
                articleDetails.category = 'article';
                articleDetails.isPreferredLanguage = true;
                articles.push(articleDetails);
            }
            this.stats.refTable = 'm2m_connected_content';
            this.stats.refRecordId = m2mGr.getUniqueValue();
            this.stats.shortDesc = 'GetAllArticlesFromConnectedContent - '.concat(m2mGr.getValue('knowledge'));
            this.performanceIndicatorUtil.postHotspot(this.stats);
        }

        if (count < articlePayload.articleCount && isKnowledgeTranslationPluginActive && isPreferredLanguageDifferentFromFallback && isSystemFallbackLanguageEnabled) {
            var consideredArticleIds = [];
            articles.forEach(function(articleDetail) {
                var translatedArticleId = this.getArticleInSpecifiedLanguage(this.getKbGrFromSysId(articleDetail.sys_id), fallBackLanguage);
                if (translatedArticleId)
                    consideredArticleIds.push(translatedArticleId);
            }, this);
            var fallbackGr = new GlideAggregate("m2m_connected_content");
            fallbackGr.addEncodedQuery(articleEncodedQuery);
            fallbackGr.addQuery('knowledge.language', fallBackLanguage);
            fallbackGr.addQuery('knowledge.sys_id', 'NOT IN', consideredArticleIds);
            fallbackGr.groupBy('knowledge');
            fallbackGr.addAggregate('AVG', 'popularity');
            fallbackGr.orderByAggregate('AVG', 'popularity');
            fallbackGr.query();
            while (fallbackGr.next() && count < articlePayload.articleCount) {
                this.stats.startTime = new GlideDateTime();
                articleDetails = this.checkAndReturnAccessibleArticle(fallbackGr.getValue('knowledge'), articlePayload.knowledgeBases, versioningEnabled, articlePayload.taxonomyId);
                if (!gs.nil(articleDetails) && !this.isArticleDuplicate(articles, articleDetails, articlePayload.ignoreArticles)) {
                    ++count;
                    articleDetails.score = fallbackGr.getAggregate('AVG', 'popularity');
                    articleDetails.category = 'article';
                    articleDetails.isPreferredLanguage = false;
                    articles.push(articleDetails);
                }
                this.stats.refTable = 'm2m_connected_content';
                this.stats.refRecordId = fallbackGr.getUniqueValue();
                this.stats.shortDesc = 'GetAllArticlesFromConnectedContent - '.concat(fallbackGr.getValue('knowledge'));
                this.performanceIndicatorUtil.postHotspot(this.stats);
            }
        }

        return articles;
    },

    _sortCatalog: function(a, b) {
        return b.count - a.count;
    },

    checkItemPrice: function(catItem) {
        if (catItem.price == 0 || catItem.price == null || catItem.price == undefined) {
            return null;
        } else {
            return catItem.price.getDisplayValue();
        }
    },

    /*calculateNormalizedScore : Calculates the Normalization score based on the data provided
    Parameters : 1) dataArr : Array of items (catalog or kb Articles) to get the zScore from
    */

    getZScore: function(dataArr) {
        if (dataArr.length == 0)
            return dataArr;

        var minScore = 0;
        var maxScore = 100;
        var max = dataArr[0];
        var min = dataArr[dataArr.length - 1];

        if (max == min) {
            dataArr[0].zScore = maxScore;
            return dataArr;
        }

        var articleSum = 0;
        dataArr.forEach(function(article) {
            articleSum = articleSum + parseInt(article.score);
        });
        var articlesMean = articleSum / dataArr.length;
        var sdSum = 0;
        dataArr.forEach(function(article) {
            sdSum = sdSum + Math.pow((article.score - articlesMean), 2);
        });

        var standardDeviation = Math.sqrt(sdSum / (dataArr.length - 1));
        dataArr.forEach(function(item) {
            item.zScore = (item.score - articlesMean) / standardDeviation;
        });

        return dataArr;
    },

    /*getNormalizedData : Gets the Normalized data after calculating the  zScores
    Parameters : 1) combinedData : An array of the most viewed kb articles and Catalog Items combined or individual data
                2) displayCount: Number of items to display
                3) isMixed: Specifies if the combined data is individual (article data or item data) or combined data
    */

    getNormalizedData: function(combinedData, displayCount, isMixed) {
        if (isMixed) {
            articleResults = combinedData.articleResults.length > 0 ? this.getZScore(combinedData.articleResults) : [];
            catalogResults = combinedData.catalogResults.length > 0 ? this.getZScore(combinedData.catalogResults) : [];
            var catalogAndArticleSortFunction =  function(a, b) {
                    return b.zScore - a.zScore;
            };
            return this._getNormalizedCatalogAndArticle(articleResults, catalogResults, catalogAndArticleSortFunction, displayCount);
        } else return this.getZScore(combinedData).sort(function(a, b) {
            return b.zScore - a.zScore;
        }).slice(0, displayCount);
    },

    _getNormalizedCatalogAndArticle: function(articleResults, catalogResults, sortFunction, displayCount) {
        var preferredArticles = [], fallbackArticles = [];
        for (var i = 0; i < articleResults.length; i++) {
            if (articleResults[i].isPreferredLanguage) {
                preferredArticles.push(articleResults[i]);
            } else {
                fallbackArticles.push(articleResults[i]);
            }
        }

        var allPreferredResults = preferredArticles.concat(catalogResults).sort(sortFunction);
        if (allPreferredResults.length >= displayCount) {
            return allPreferredResults.slice(0, displayCount);
        } else {
            fallbackArticles = fallbackArticles.sort(sortFunction);
            return allPreferredResults.concat(fallbackArticles).slice(0, displayCount);
        }
    },

    /*getTranslatedArticle: returns a valid articleId based on the User Preffered Language / Fallback language
    Parameters: 1) articleId : sys id of the KB
                2) preferredLanguage: User preferred language
                3) fallBackLanguge: System Fallback Language
    */

    getTranslatedArticle: function(articleId, preferredLanguage, fallBackLanguage) {
        var articleGr = new sn_ex_sp.KBContentTranslationUtil().getKbGr(articleId);
        if (articleGr) {
            var preferredArticleId = this.getArticleInSpecifiedLanguage(articleGr, preferredLanguage);
            if (!gs.nil(preferredArticleId)) {
                return preferredArticleId;
            } else {
                return this.getArticleInSpecifiedLanguage(articleGr, fallBackLanguage);
            }
        }
        return null;
    },

    /*getArticleInSpecifiedLanguage: returns articleId / null if present in language
    Parameters: 1) articleGr: article GlideRecord
                2) langugage: preferred Language
    */

    getArticleInSpecifiedLanguage: function(articleGr, langugage) {
        if (articleGr.getValue('language') === langugage) {
            return articleGr.getUniqueValue();
        }
        var translatedGr = new sn_ex_sp.KBContentTranslationUtil().getTranslatedVersionsFromGr(articleGr, langugage);
        while (translatedGr.next()) {
            if (translatedGr.getValue('workflow_state') === 'published')
                return translatedGr.getUniqueValue();
        }
        return null;
    },

    /*isArticleDuplicate: returns true / false based on object already part of array
    Parameters: 1) articleArray : article Array
                2) currentArticle: current Article Object
                3) ignoredArticle: ignore Artilces Array
    */

    isArticleDuplicate: function(articleArray, currentArticle, ignoreArticles) {
        if (!gs.nil(ignoreArticles)) {
            if (ignoreArticles.indexOf(currentArticle.sys_id) !== -1) {
                return true;
            }
        }
        return articleArray.some(function(element) {
            return element.sys_id === currentArticle.sys_id;
        });
    },

    type: 'UserRecommendationUtilSNC'
};
