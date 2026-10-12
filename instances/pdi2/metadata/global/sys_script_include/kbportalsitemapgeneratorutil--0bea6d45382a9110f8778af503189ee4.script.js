var KBPortalSitemapGeneratorUtil = Class.create();
KBPortalSitemapGeneratorUtil.prototype = {
    initialize: function () {
        this.spUtil = new GlideSPUtil();
        this.kbViewModel = new KBViewModel();
    },

    getTranslatedArticlesList: function (kbGr) {
        if (GlidePluginManager().isActive('com.glideapp.knowledge.i18n2'))
            return this.kbViewModel.getLanguagesToDisplay(kbGr);
    },

    isSPPagePubliclyAccessible: function (spPageGr) {
        if (spPageGr) {
            return spPageGr.getValue('public') == '1' ? true : false;
        }
        return false;
    },

    isHumanReadableUrlEnabled: function (spPageGr) {
        var humanReadableURLStructure = '';
        if (spPageGr)
            humanReadableURLStructure = spPageGr.getValue('human_readable_url_structure') || '';
        if (humanReadableURLStructure.trim())
            return true;
        return false;
    },


    getPubliclyAccessibleArticles: function (servicePortalUrlSuffix, servicePortalSysId, kbPageId, baseportalURL) {
        var currUserId = gs.getUserID();
        gs.getSession().impersonate('guest');

        var spPageGr = new GlideRecord('sp_page');
        spPageGr.addQuery('id', kbPageId);
        spPageGr.query();
        
        if (spPageGr.next() && !this.isSPPagePubliclyAccessible(spPageGr)){
            gs.getSession().impersonate(currUserId);
            return '';
        }

        // get knowledge bases associated with the service portal
        var knowledgeBaseIds = [];
        var gr = new GlideRecord('m2m_sp_portal_knowledge_base');
        gr.addQuery('sp_portal', servicePortalSysId);
        gr.query();
        while (gr.next()) {
            var knowBaseId = gr.getValue('kb_knowledge_base');
            knowledgeBaseIds.push(knowBaseId);
        }

        // get knowledge articles in the knowledge bases that can be accessed publicly
        var encodedQuery = 'kb_knowledge_baseIN' + knowledgeBaseIds.join();
        encodedQuery += '^sys_class_name!=kb_knowledge_block';
        var kbGr = new GlideRecord('kb_knowledge');
		if(knowledgeBaseIds.length > 0){
			kbGr.addEncodedQuery(encodedQuery);
		}
        kbGr.addQuery('active', true);
        kbGr.addQuery('workflow_state', 'published');
        kbGr.query();

        var urlEntities = '';
        var spSEOHeaderTagsSNC = new global.SPSEOHeaderTagsSNC();

        while (kbGr.next()) {
            if (kbGr.canRead()){
                var translatedArticles = this.getTranslatedArticlesList(kbGr);
                var kbLang = kbGr.getValue('language') || 'en';
                var kbNumber = kbGr.getValue('number');
                var lastMod = kbGr.getValue('sys_updated_on').split(' ')[0];
                var queryParams = 'id=' + kbPageId + '&sysparm_article=' + kbNumber;
                
                var humanReadablePart = '';
                if (this.isHumanReadableUrlEnabled(spPageGr))
                    humanReadablePart = this.getHumanReadableUrls(spPageGr, queryParams);
                
                var kbUrl = baseportalURL + '/' + servicePortalUrlSuffix + '/' + kbLang + humanReadablePart + '?' + queryParams;
                urlEntities += '<url>\n' +
                    '<loc>' + kbUrl + '</loc>\n' +
                    '<lastmod>' + lastMod + '</lastmod>\n';
                
                if (translatedArticles && translatedArticles.length > 1) {
                    // add href lang if more than 1 language is found in translatedArticles
                    for (var i in translatedArticles) {
                        var locale = translatedArticles[i].language;
                        var translatedArticleQParams = 'id=' + kbPageId + '&sysparm_article=' +  translatedArticles[i].number;
                        var tempKbUrl = baseportalURL + '/' +servicePortalUrlSuffix + '/' + locale +  this.getHumanReadableUrls(spPageGr, translatedArticleQParams) + '?' + translatedArticleQParams;
                        urlEntities += '<xhtml:link rel="alternate" hreflang="' + locale + '" href="' + tempKbUrl + '"/>\n';
                            
                    }
                }
                urlEntities += '</url>\n';
            }
        }
		var todayDate  = new GlideDate();
        if (urlEntities){
			urlEntities = '<url>\n<loc>'  + baseportalURL + '/' + servicePortalUrlSuffix + '?id=kb_home' + '</loc>\n<lastmod>'+todayDate+'</lastmod>\n</url>\n'
                            +'<url>\n<loc>' + baseportalURL + '/' + servicePortalUrlSuffix + '?id=kb_search' + '</loc>\n<lastmod>'+todayDate+'</lastmod>\n</url>\n'
                            + urlEntities;
		}
        urlEntities = urlEntities.replaceAll('&', '&amp;');
        gs.getSession().impersonate(currUserId);
        return urlEntities;
    },

    getPubliclyAccessibleCatalogItems: function (servicePortalUrlSuffix, servicePortalSysId, catalogPageId, baseportalURL) {
        var currUserId = gs.getUserID();
        gs.getSession().impersonate('guest');
        
        var spPageGr = new GlideRecord('sp_page');
        spPageGr.addQuery('id', catalogPageId);
        spPageGr.query();
        
        if (spPageGr.next() && !this.isSPPagePubliclyAccessible(spPageGr)){
            gs.getSession().impersonate(currUserId);
            return '';
        }
            
        // get catalogs associated with the service portal
        var catalogIds = [];
        var gr = new GlideRecord('m2m_sp_portal_catalog');
        gr.addQuery('sp_portal', servicePortalSysId);
        gr.query();
        while (gr.next()) {
            var catId = gr.getValue('sc_catalog');
            catalogIds.push(catId);
        }
        
        // get catalog items in catalogs that can be accessed publicly
        var encodedQuery = 'sc_catalogsIN' + catalogIds.join();
        var scCatGr = new GlideRecord('sc_cat_item');
        scCatGr.addEncodedQuery(encodedQuery);
        scCatGr.addQuery('active', true);
        scCatGr.query();
        
        var urlEntities = '';
        
        while (scCatGr.next()) {
            if (scCatGr.canRead()){
                var scCatSysId = scCatGr.getValue('sys_id');
                var lastMod = scCatGr.getValue('sys_updated_on').split(' ')[0];
                var queryParams = 'id=' + catalogPageId + '&sys_id=' + scCatSysId;
                var humanReadablePart = '';
                if (this.isHumanReadableUrlEnabled(spPageGr))
                    humanReadablePart = this.getHumanReadableUrls(spPageGr, queryParams);
                    
                var scCatUrl = baseportalURL + '/' + servicePortalUrlSuffix + humanReadablePart + '?' + queryParams;
                urlEntities = urlEntities + '<url>\n' +
                    '<loc>' + scCatUrl + '</loc>\n' +
                    '<lastmod>' + lastMod + '</lastmod>\n';
                urlEntities += '</url>\n';
            }
        }
        urlEntities = urlEntities.replaceAll('&', '&amp;');
        gs.getSession().impersonate(currUserId);
        return urlEntities;
    },

    getHumanReadableUrls: function (spPageGr, queryParams) {
        var humanReadablePart = '';
        if (spPageGr)
            humanReadablePart = this.spUtil.getHumanReadableUrl(spPageGr, queryParams);
        if (humanReadablePart)
            humanReadablePart = '/' + humanReadablePart;
        return humanReadablePart;
    },

    type: 'KBPortalSitemapGeneratorUtil'
};
