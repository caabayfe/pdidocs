var cxs_SearchResultLinkBuilder = Class.create();
cxs_SearchResultLinkBuilder.prototype = {
    initialize: function() {
        this._baseURL = gs.getProperty('glide.servlet.uri');
    },

    build: function(contextualSearchResult, portal, isRegularResults, dynamicChoiceNodeName, vaSystem, vaContext) {
        var id = contextualSearchResult.id.split(':');
        var resourceType = id[0];
        var resourceId = id[1];
        var exp = (gs.getProperty('com.snc.contextual_search.va_topic.top_result_experience') == 'true') ? true : false;

        var link = {
            "label": contextualSearchResult.title,
            "link": this._getResourceURL(contextualSearchResult.link),
            "description": contextualSearchResult.snippet.substring(0, 240),
            "context_label": !gs.nil(contextualSearchResult.meta.card_label) ? contextualSearchResult.meta.card_label : contextualSearchResult.meta.source,
            "document_id": resourceId,
            "document_table": resourceType
        };
        var urlSuffix = this.getURLfromFullView(contextualSearchResult.meta.full_view_url);

        if (resourceType == "kb_social_qa_question") {
            if (contextualSearchResult.meta.accepted) {
                if (!gs.nil(portal)) {
                    link.link = this._baseURL + portal + "?id=kb_social_qa_question&sys_id=" + resourceId;
                }
            } else if (contextualSearchResult.meta.source == "community_question") {
                link.context_label = gs.getMessageLang("Community Discussion", vaContext.getRequesterLang());
                var gr = new GlideRecord("kb_social_qa_question");
                gr.get(resourceId);
                if (!gs.nil(gr.accepted_answer)) {
                    if (!gs.nil(portal)) {

                        if (!gs.nil(urlSuffix)) {
                            link.link = this._baseURL + portal + urlSuffix;
                        } else {
                            link.link = this._baseURL + portal + "?id=community_question&sys_id=" + resourceId;
                        }
                    }
                } else {
                    return {};
                }
            } else {
                return {};
            }
        } else if (resourceType == "kb_knowledge") {
            if (!gs.nil(portal)) {
                link.link = this._baseURL + portal + "?id=kb_article&sys_id=" + resourceId;
            }
        } else if (resourceType == "sn_communities_blog") {
            link.context_label = gs.getMessageLang("Community Blog", vaContext.getRequesterLang());
            if (!gs.nil(portal)) {
                if (!gs.nil(urlSuffix)) {
                    link.link = this._baseURL + portal + urlSuffix;
                } else {
                    link.link = this._baseURL + portal + "?id=community_blog&sys_id=" + resourceId;
                }
            }
        } else if (resourceType == "kb_social_qa_answer") {
            return {};
        } else if (resourceType == "sc_cat_item") {
            var item = new sn_sc.CatItem(resourceId);
            var isContentItem = new GlideRecord('sc_cat_item_content');
            if (isContentItem.get(resourceId) && isContentItem.content_type == "external")
                link.link = contextualSearchResult.link;
            else if (this.shouldUseSeismicPopup(resourceType, resourceId, isRegularResults) && exp)
                link.link = this.createSeismicPopupURL(resourceId, vaSystem, dynamicChoiceNodeName);
            else if (!gs.nil(portal) && (item && item.getRecordClass() === "sc_cat_item_guide"))
                link.link = this._baseURL + portal + "?id=sc_cat_item_guide&sys_id=" + resourceId + '&referrer=va';
            else if (gs.nil(portal) && (item && item.getRecordClass() === "sc_cat_item_guide"))
                link.link = this._baseURL + "com.glideapp.servicecatalog_cat_item_guide_view.do?sysparm_guide=" + resourceId + '&referrer=va';
            else if (!gs.nil(portal))
                link.link = this._baseURL + portal + "?id=sc_cat_item&sys_id=" + resourceId + '&referrer=va';
            else
                link.link = this._baseURL + "com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=" + resourceId + '&referrer=va';
        }
        return link;
    },

    shouldUseSeismicPopup: function(table, sysId, isRegularResults) {
        var shouldUseSeismicPopup = false;
        var isCatalogSupported = new sn_sc.CatalogConversationHelper().getConversationalRenderType(sysId, true);

        if (table == "sc_cat_item" && (isCatalogSupported == "popup-seismic" || isCatalogSupported == "conversation"))
            shouldUseSeismicPopup = true;

        return shouldUseSeismicPopup;
    },
    createSeismicPopupURL: function(sysId, vaSystem, dynamicChoiceNodeName) {
        var requestedFor = gs.getUserID();
        var sessionId = vaSystem.getSessionIdOnConversation();
        var conversationId = vaSystem.getConversationId();
        var taskId = vaSystem.getConversationTaskId();
        var baseUrl = gs.getProperty('glide.servlet.uri');

        var seismicUrl = baseUrl + "now/virtual-agent/content/catalog/" + sysId + "/" + requestedFor + "/" + conversationId + "/" + taskId + "/" + sessionId + "/" + dynamicChoiceNodeName;
        if (!gs.isLoggedIn())
            seismicUrl += baseUrl + "/params/guestSessionIdentifier/" + vaSystem.getGuestSessionIdentifier();
        seismicUrl += "/?referrer=popup&engagement_channel=va";

        return seismicUrl;
    },

    getURLfromFullView: function(fullViewURL) {
        if (!gs.nil(fullViewURL)) {
            var url = fullViewURL.split('?');
            return "?" + url[1];
        }
        return '';
    },

    _getResourceURL: function(srcResultLink) {
        if (srcResultLink.startsWith('http') || srcResultLink.startsWith('www'))
            return srcResultLink;

        return this._baseURL + srcResultLink;
    },

    type: 'cxs_SearchResultLinkBuilder'
};
