var VAGlobalContextualSearchUtil = Class.create();
VAGlobalContextualSearchUtil.prototype = {
    searchTerm: '',
    searchTime: '',
    apiResponseTime: '',
    searchResultsLength: '',
    searchId: '',

    initialize: function() {},

    search: function(context, searchTerm, kbKnowledgeBase, portal) {
        this.searchTerm = searchTerm;

        //time when search term was sent
        this.searchTime = global.VAClickMetrics.getCurrentTime();

        //unique ID for every contextual search
        this.searchId = global.VAClickMetrics.createGUID();

        // query object to be sent for the search
        this.query = {};
        this.query.freetext = "" + searchTerm;
        if (!gs.nil(kbKnowledgeBase)) {
            this.query.kb_knowledge_base = ["" + kbKnowledgeBase];
        }
        if (!gs.nil(portal)) {
            this.query.portal_request = true;
            this.query.portal_suffix = portal;
            this.query.searchParameters = {};
        }

        var payload = {
            meta: {
                includePinnedArticles: true,
                applyFilter: true,
                window: {
                    start: 0,
                    end: 20
                },
                limit: 20,
            },
            query: this.query,
            context: !gs.nil(context) ? context : undefined,
            searchSource: 'virtual_agent'
        };

        var request = new global.cxs_SearchAPI();
        var startSearch = new Date().getTime();
        var response = request.search(payload);
        var endSearch = new Date().getTime();
        this.apiResponseTime = endSearch - startSearch;
        response.searchId = this.searchId;

        return response;
    },

    // true for success, false for failure
    processSearchResponse: function(response) {
        return response.status && response.status.code == 200;
    },

    // These error handling is for the contextual search engine only.
    processSearchErrors: function(response) {
        if (response.status.code != 200)
            return gs.getMessageLang('Error while performing search', vaContext.getRequesterLang());
    },

    processGeneralResults: function(response, maxResults, confidenceThreshold, systemVars) {
		if(!gs.nil(systemVars)){
			vaSystem = systemVars;
		}
        var results = response.results;
        var relevantResults = [];
        //results coming from different searchs could be the same, only need one
        var ids = [];

        if (results.length > 0) {
            for (var i = 0; results[i] && relevantResults.length < maxResults; i++) {
                // Result is unique and score > confidenceThreshold
                if (ids.indexOf(results[i].id) == -1 && results[i].meta.score >= confidenceThreshold) {
                    relevantResults.push(results[i]);
                    ids.push(results[i].id);
                }
            }
        }
        this.searchResultsLength = relevantResults.length;

        if (global.VAClickMetrics.isContextualSearchClickMetricsAllowed())
            this._sendPayloadForSearchTriggered(vaSystem);

        return relevantResults;
    },

    getContextualSearchVariableAndContext: function(catologItemId) {
        var searchConfig = {};
        var rpConfigGr = new GlideRecord('cxs_rp_config');
        rpConfigGr.addQuery('sc_cat_item', catologItemId);
        rpConfigGr.addActiveQuery();
        rpConfigGr.query();
        if (rpConfigGr.next()) {
            searchConfig.context = rpConfigGr.getValue('cxs_context_config');
            searchConfig.searchVariable = rpConfigGr.getValue('search_variable');
        }
        return searchConfig;
    },

    getLinks: function(header, variables, systemVars, contextVars) {
		if(!gs.nil(systemVars)){
			vaSystem = systemVars;
		}
		if(!gs.nil(contextVars)){
			vaContext = contextVars;
		}
        var groupedLinksOutMsg = new sn_cs.GroupedPartsOutMsg();
        groupedLinksOutMsg.setHeader(header);
        var limit = parseInt(variables.limit);
        var searchJsonObj = JSON.parse(variables.search_result_json_string);
        var index = parseInt(variables.index);

        var linkBuilder = new global.cxs_SearchResultLinkBuilder();
        for (var i = index; i < index + limit && i < searchJsonObj.length; i++) {
            var link = linkBuilder.build(searchJsonObj[i], variables.portal, true, variables.dynamicChoiceNodeName, vaSystem, vaContext);

            if (link && link.link) {
                var resultLink = this._createPayloadForClickMetrics(link, variables, i, vaSystem);
                groupedLinksOutMsg.addLinkPart(link.label, resultLink, link.description, link.context_label);
            } else
                index++;
        }
        return groupedLinksOutMsg;
    },

    processTopResultData: function(searchResponse) {
        var topResult = JSON.parse(searchResponse)[0];
        return JSON.stringify(topResult);
    },

    generateTopResultCard: function(variables, vaSystem, vaInputs, vaVars, contextVars) {
		if(!gs.nil(contextVars)){
			vaContext = contextVars;
		}
        var cardDetails = JSON.parse(variables.top_result);
        var topResultData = {};
        var id = cardDetails['id'].split(':');
        var tableName = id[0].toString();
        var sysID = id[1].toString();

        var cardLabel = cardDetails['meta']['card_label'].toString();
        if (tableName == "sc_cat_item") {

            vaVars.catalogId = '';
            try {
                var isCatalogSupported = new sn_sc.CatalogConversationHelper().hasVASupport(sysID);
                if (isCatalogSupported) {
                    vaVars.catalogId = sysID;
                } else {
                    topResultData["linkLabel"] = gs.getMessageLang("Request this item", vaContext.getRequesterLang());
                    var linkBuilder = new global.cxs_SearchResultLinkBuilder();
                    var link = linkBuilder.build(cardDetails, variables.portal, false, variables.dynamicChoiceNodeName, vaSystem, vaContext);
                    if (link && link.link) {
                        var resultLink = this._createPayloadForClickMetrics(link, variables, 0, vaSystem);
                        topResultData["linkHref"] = resultLink;
                    }
                }
            } catch (e) {
                gs.info("No Catalog Id found for this search result.");
            }

            topResultData["identifier"] = cardLabel;
            topResultData["image"] = gs.nil(cardDetails['image']['link'].toString()) ? 'default-cart-icon.svg' : cardDetails['image']['link'].toString();
            topResultData["header"] = cardDetails['title'].toString();

            var description = gs.nil(cardDetails["meta"]["description"].toString()) ? cardDetails["snippet"] : cardDetails["meta"]["description"];
            if (variables.deviceType == "mweb") {
                topResultData["description"] = description;
            } else {
                description = new GlideSPScriptable().stripHTML(description);
                topResultData["description"] = description.toString().substring(0, 400);
            }

            topResultData["alt"] = gs.getMessageLang("Image of {0}", vaContext.getRequesterLang(), [cardDetails['title'].toString()]);

            var fields = [];
            try {
                var cat_gr = new GlideRecord('sc_cat_item');
                cat_gr.get(sysID);
                var catalogItemJS = new sn_sc.CatItem(sysID);
                var itemPrice = catalogItemJS.getCompleteItemPrice();
                if (cat_gr.getValue('display_price_property') != 'never' && !gs.nil(itemPrice)) {
                    fields.unshift({
                        "fieldLabel": "Price",
                        "fieldValue": itemPrice,
                        "showSeparator": "show"
                    });
                }
            } catch (e) {
                gs.info("Problem in finding the Catalog item price");
            }
            topResultData["fields"] = fields;
        }

        return vaSystem.renderCard("CatalogCard", JSON.stringify(topResultData));
    },

    isTopResultCardSupported: function(cardData) {
        try {
            if (gs.nil(cardData))
                return false;

            var cardDetails = JSON.parse(cardData);
            var id = cardDetails.id.split(':');
            var resourceType = id[0];
            var resourceId = id[1];
            var description = gs.nil(cardDetails["meta"]["description"].toString()) ? cardDetails["snippet"] : cardDetails["meta"]["description"];
            var cardLabel = cardDetails['meta']['card_label'].toString();
            if (!((!gs.nil(resourceType) && !gs.nil(resourceId)) || !gs.nil(cardLabel) || !gs.nil(description))) {
                return false;
            }

            var isCardSupported = (resourceType == 'sc_cat_item') ? true : false;
            if (!isCardSupported) {
                return isCardSupported;
            } else {
                var isContentItem = new GlideRecord('sc_cat_item_content');
                if (isContentItem.get(resourceId) && isContentItem.content_type == "external")
                    return false;
                else
                    return true;
            }
        } catch (ex) {
            gs.info("Error calculating whether to show Contextual Search top result");
            return false;
        }
    },

    _createPayloadForClickMetrics: function(link, variables, order, vaSystem) {

        var scratchPad = {};

        if (!global.VAClickMetrics.isContextualSearchClickMetricsAllowed()) {
            // When the feature is disabled, There's a special marker that needs to be appended to the original URL so that overriding URL can be to be prevented on the backend.
            // Without the marker, this URL can be converted to click metrics URL if the bot_output event type is set to true.
            // Since it is not possible to tell the URL is composed by contextual search or the bot_reponse on the backend at runtime. 
            // So, the URL with the marker indicates "don't convert to click metrics URL" on the backend. The marker will be removed automatically when detected on the backend.
            return global.VAClickMetrics.createClickMetricsURL(vaSystem, link.link, scratchPad, global.VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH);
        }

        this.searchTime = global.VAClickMetrics.getCurrentTime();
        var portal = variables.portal + '';
        var searchTerm = variables.search_term + '';
        var searchId = variables.search_Id + '';
        //contextText is the data_source
        var contextText = link.context_label;
        var description = SNC.GlideHTMLSanitizer.sanitize(link.description) + '';

        scratchPad = {
            'Title': link.label,
            'Description': description,
            'Search Term': searchTerm,
            'Portal': portal,
            'Data Source Title': contextText,
            'Search Id': searchId,
            'Order': order + '',
            'Document Id': link.document_id,
            'Document Table': link.document_table
        };
        var newLink = global.VAClickMetrics.createClickMetricsURL(vaSystem, link.link, scratchPad, global.VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH);
        this._sendPayloadForSearchDisplayed(scratchPad, vaSystem);
        return newLink;
    },

    _sendPayloadForSearchTriggered: function(vaSystem) {
        var payload = {};
        payload[global.VAClickMetricsConstants.KEY_SEARCH_TERM] = this.searchTerm + '';
        payload[global.VAClickMetricsConstants.KEY_TIME] = this.searchTime + '';
        payload[global.VAClickMetricsConstants.KEY_RESPONSE_TIME] = this.apiResponseTime + '';
        payload[global.VAClickMetricsConstants.KEY_RESULTS_COUNT] = this.searchResultsLength + '';
        payload[global.VAClickMetricsConstants.KEY_LANGUAGE] = gs.getSession().getLanguage();
        payload[global.VAClickMetricsConstants.KEY_NAME] = global.VAClickMetricsConstants.VALUE_SEARCH_TRIGGERED;
        payload[global.VAClickMetricsConstants.KEY_SEARCH_ID] = this.searchId + '';

        var conversationId = vaSystem.getConversationId();
        payload[global.VAClickMetricsConstants.CONVERSATION_ID] = conversationId;

        var taskId = vaSystem.getConversationTaskId();
        payload[global.VAClickMetricsConstants.CONVERSATION_TASK_ID] = taskId;
        payload[global.VAClickMetricsConstants.KEY_SEARCH_TYPE] = global.VAClickMetricsConstants.VALUE_CONTEXTUAL;

        global.VAClickMetrics.queueContextualSearchEvent(conversationId, taskId, payload);
    },

    _sendPayloadForSearchDisplayed: function(scratchPad, vaSystem) {
        var payload = {};

        payload[global.VAClickMetricsConstants.KEY_SEARCH_TERM] = scratchPad['Search Term'];
        payload[global.VAClickMetricsConstants.KEY_TIME] = this.searchTime + '';
        payload[global.VAClickMetricsConstants.KEY_TITLE] = scratchPad['Title'];
        payload[global.VAClickMetricsConstants.KEY_DESCRIPTION] = scratchPad['Description'];
        payload[global.VAClickMetricsConstants.KEY_ORDER] = scratchPad['Order'];
        payload[global.VAClickMetricsConstants.KEY_DOCUMENT_ID] = scratchPad['Document Id'];
        payload[global.VAClickMetricsConstants.KEY_DOCUMENT_TABLE] = scratchPad['Document Table'];
        payload[global.VAClickMetricsConstants.KEY_SEARCH_ID] = scratchPad['Search Id'];
        payload[global.VAClickMetricsConstants.KEY_DATA_SOURCE_TITLE] = scratchPad['Data Source Title'];
        payload[global.VAClickMetricsConstants.KEY_NAME] = global.VAClickMetricsConstants.VALUE_SEARCH_RESULT_DISPLAYED;

        var conversationId = vaSystem.getConversationId();
        payload[global.VAClickMetricsConstants.CONVERSATION_ID] = conversationId;

        var taskId = vaSystem.getConversationTaskId();
        payload[global.VAClickMetricsConstants.CONVERSATION_TASK_ID] = taskId;

        payload[global.VAClickMetricsConstants.KEY_SEARCH_TYPE] = global.VAClickMetricsConstants.VALUE_CONTEXTUAL;

        global.VAClickMetrics.queueContextualSearchEvent(conversationId, taskId, payload);
    },

    type: 'VAGlobalContextualSearchUtil'
};
