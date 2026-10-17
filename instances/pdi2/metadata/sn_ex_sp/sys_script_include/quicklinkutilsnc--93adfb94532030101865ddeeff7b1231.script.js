var QuickLinkUtilSNC = Class.create();
QuickLinkUtilSNC.prototype = {
    initialize: function() {
        this.QUICKLINK_TABLE = 'sn_ex_sp_quick_link';
        this.M2M_TOPIC_QUICKLINKS_TABLE = 'm2m_connected_content';
        this.CONVERT_FN_MAP = {
            'knowledge': this._convertKnowledge,
            'catalog_item': this._convertCatalog,
            'page': this._convertPage,
            'external_link': this._convertExternalLinks,
            'guided_help': this._convertGuidedHelp
        };
        this.TAXONOMY_CONTENT_CONFIGURATION_QUICK_LINK = '07f4b6bfe75430104cda66ef11e8a9a9';
        this.SP_PAGE_CAN_VIEW = 'm2m_sp_page_uc_can_view';
        this.SP_PAGE_CANNOT_VIEW = 'm2m_sp_page_uc_cannot_view';
        this.QUICK_LINK_CAN_VIEW = 'sn_ex_sp_quick_link_user_criteria_mtom';
        this.URL_ENABLED = gs.getProperty("sn_ex_sp.enable.image.url.support");
        this.KB_EXTENDED_TABLES = new GlideTableHierarchy('kb_knowledge').getAllExtensions();
    },

    fetchQuicklinksForTopic: function(topicId) {
        var quickLinks = this._fetchQuicklinksForTopic(topicId) || [];
        return quickLinks;
    },

    fetchQuicklinksForHomePage: function(quickLinksList, instanceId, limitTo, statsParentId) {
        var quickLinks = this._fetchQuicklinksForHomePage(quickLinksList, false, instanceId, limitTo, statsParentId) || [];
        return quickLinks;
    },

    fetchQuicklinksForGetSupport: function(quickLinksList) {
        var quickLinks = this._fetchQuicklinksForHomePage(quickLinksList, true) || [];
        return quickLinks;
    },

    fetchQuicklinkRecordForPortalNavMenuItem: function(navItemQuickLinkGr) {
        var quickLinkRecord = this._convert(navItemQuickLinkGr.quick_link.getRefRecord(), navItemQuickLinkGr.order);
        return quickLinkRecord;
    },

    /**
     * Public method to convert a quick link record
     * @param quickLinkGr - GlideRecord of the quick link
     * @param order - order value for the quick link
     * @returns {Object} Converted quick link object
     */
    convert: function(quickLinkGr, order) {
        return this._convert(quickLinkGr, order);
    },

    canRead: function(quicklink, isMobile) {
        if (!this._quickLinkCanView(quicklink)) {
            return false;
        }
        var content = quicklink[quicklink.content_type].getRefRecord();
        if (quicklink.content_type == 'page') {
            if (GlidePluginManager.isActive('com.glide.service-portal.user-criteria') && gs.getProperty('glide.service_portal.user_criteria_enabled') == 'true') {
                if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(),
                        this._fetchUserCriteria(content, this.SP_PAGE_CANNOT_VIEW))) {
                    return false;
                }

                // DEF0276036
                var m2mCanViewGr = new GlideRecord(this.SP_PAGE_CAN_VIEW);
                m2mCanViewGr.addQuery('sp_page', content.getUniqueValue());
                m2mCanViewGr.query();
                if (!m2mCanViewGr.hasNext()) {
                    return true;
                }

                if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(),
                        this._fetchUserCriteria(content, this.SP_PAGE_CAN_VIEW))) {
                    return true;
                }
                return false;
            }

            var roles = content.getDisplayValue("roles");

            if (!roles && GlidePluginManager.isActive('com.glide.explicit_roles')) {
                roles = 'snc_internal';
            }

            if (!roles) {
                return true;
            }

            roles = roles.split(",").map(function(item) {
                return item.trim();
            });

            if (!GlidePluginManager.isActive('com.glide.explicit_roles')) {
                var explicitRoles = ["snc_internal", "snc_external"];
                for (var i = 0; i < explicitRoles.length; i++) {
                    var explicitRoleIndex = roles.indexOf(explicitRoles[i]);
                    if (explicitRoleIndex >= 0) {
                        roles.splice(explicitRoleIndex, 1);
                    }
                }
            }

            if (!roles.length) {
                return true;
            }
            var currentUser = gs.getUser();
            return roles.some(function(item) {
                return currentUser.hasRole(item);
            });
        } else if (quicklink.content_type == 'catalog_item') {
            return new global.CatalogContentProcessor().canView(content.sys_id, gs.getUserID(), isMobile);
        } else if (quicklink.content_type == 'external_link') {
            return new sn_ex_sp.ExternalLinkUtil().canRead(content.sys_id);
        } else if (quicklink.content_type == 'guided_help') {
            if (isMobile == true) {
                return false;
            }
            return new sn_ex_sp_gd_help.GuidedHelpUtil().canRead(content.sys_id);
        }
        return content.canRead();
    },

    _quickLinkCanView: function(quicklink) {
        var canViewCriteriaList = this._fetchUserCriteria(quicklink, this.QUICK_LINK_CAN_VIEW);
        if (!canViewCriteriaList.length) {
            return true;
        }
        if (sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), canViewCriteriaList)) {
            return true;
        }
        return false;
    },

    _fetchQuicklinksForTopic: function(topicId) {
        var gRecord = new GlideRecord(this.M2M_TOPIC_QUICKLINKS_TABLE);
        gRecord.addQuery('topic', topicId);
        gRecord.addQuery('topic.active', true);
        gRecord.addQuery('content_type', this.TAXONOMY_CONTENT_CONFIGURATION_QUICK_LINK);
        gRecord.addQuery('quick_link.active', true);
        gRecord.orderBy('order');
        gRecord.query();
        var quickLinks = [];
        while (gRecord.next()) {
            this.pushNotNull(quickLinks, this._convert(gRecord.quick_link.getRefRecord(), gRecord.getValue('order')));
        }
        this._sortByTitle(quickLinks);
        return quickLinks;
    },

    _sortByTitle: function(quickLinks) {
        quickLinks.sort(function(left, right) {
            if (left.order == right.order) {
                return left.title.localeCompare(right.title);
            }
            if (Number(left.order) < Number(right.order)) {
                return -1;
            }
            return 1;
        });
    },

    _fetchQuicklinksForHomePage: function (quickLinksList, overrideShortDesc, instanceId, limitTo, statsParentId) {
        var stats = {};
        stats.callerId = instanceId;
        stats.callerTable = instanceId ? 'sp_instance' : '';
        stats.parentId = statsParentId;
        stats.textPrefix = 'Fetch Quicklinks For HomePage';
        stats.userId = gs.getUserID();
        var performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();
        var quickLinks = [];
        var quickLinksMap = {};

        if (gs.nil(quickLinksList)) return quickLinks;
        var quickLinksArray = quickLinksList.split(',');
        limitTo = limitTo || quickLinksArray.length;

        var gRecord = new GlideRecord(this.QUICKLINK_TABLE);
        gRecord.addQuery('sys_id', 'IN', quickLinksList);
        gRecord.addActiveQuery();
        gRecord.query();

        var quickLinksCurrentCount = 0;

        while (gRecord.next() && quickLinksCurrentCount < limitTo) {
            stats.startTime = new GlideDateTime();
            var quickLinkData = this._convert(gRecord, 1, overrideShortDesc);
            stats.refTable = this.QUICKLINK_TABLE;
            stats.refRecordId = gRecord.getUniqueValue();
            stats.shortDesc = '';
            performanceIndicatorUtil.postHotspot(stats);
            if (!gs.nil(quickLinkData)) {
                quickLinksMap[gRecord.getUniqueValue()] = quickLinkData;
                quickLinksCurrentCount++;
            }
        }
        quickLinksCurrentCount = 0;
        for (var quickLinkIndex = 0; quickLinkIndex < quickLinksArray.length && quickLinksCurrentCount < limitTo; quickLinkIndex++) {
            var quickLink = quickLinksMap[quickLinksArray[quickLinkIndex]];
            if (quickLink) {
                quickLinks.push(quickLink);
                quickLinksCurrentCount++;
            }
        }
        
        return quickLinks;
    },

    _fetchImage: function(sysProperty) {
        var imageRecord = gs.getProperty(sysProperty, '');
        var gRecord = new GlideRecord('db_image');
        gRecord.addQuery('sys_id', imageRecord);
        gRecord.addActiveQuery();
        gRecord.query();
        if (gRecord.next()) {
            return gr.getDisplayValue('image');
        }
        return '';
    },

    // Convert the quicklink db object to the json representation required for UI.
    _convert: function(quickLink, order, overrideShortDesc) {
        if (quickLink.isValidRecord()) {
            var content = quickLink[quickLink.content_type].getRefRecord();
            var sessionLanguage = gs.getSession().getLanguage();
            if (sessionLanguage != 'en') {
                var tableName = content.getTableName();
                if (this.KB_EXTENDED_TABLES.indexOf(tableName) != -1) {
                    var kbContentUtil = new sn_ex_sp.KBContentTranslationUtil();
                    var kbGr = kbContentUtil.getKbGr(content.sys_id);
                    var translatedKbGr = kbContentUtil.getTranslatedVersionsFromGr(kbGr, sessionLanguage);
                    if (translatedKbGr.next()) {
                        content = translatedKbGr;
                    }
                }
            }
            if (this.canRead(quickLink)) {
                return this.mergeObjects(this.CONVERT_FN_MAP[quickLink.content_type].call(this, content, quickLink), this._convertQuickLink(quickLink, order, overrideShortDesc, content));
            }
        }
    },

    _convertQuickLink: function(quickLink, order, overrideShortDesc, content) {
        var displayObj = {
            'order': order,
            'type': quickLink.getValue('content_type'),
            'id': quickLink.getUniqueValue(),
            'content_id': content.getUniqueValue()
        };
        if (quickLink.override_title) {
            displayObj['title'] = quickLink.override_title.getDisplayValue();
        }
        if (quickLink.override_short_desc || overrideShortDesc === true) {
            displayObj['shortDescription'] = quickLink.override_short_desc.getDisplayValue();
        }
        displayObj['bg_image'] = this._getImage(quickLink.background_image_url.toString(), quickLink.background_image.getDisplayValue(), "medium");
        displayObj['icon'] = this._getImage(quickLink.icon_url.toString(), quickLink.icon.getDisplayValue(), "small");
        return displayObj;
    },

    /**
     * @param url : image's url
     * @param img : image
     * @param size (optional) : size of the image to be rendered
     */
    _getImage: function(url, image, size) {
        if (this.URL_ENABLED && this.URL_ENABLED === "true" && url)
            return url;
        if (image) {
            if (size) return image + '?t=' + size;
            return image;
        }
        return null;
    },

    _convertKnowledge: function(kbContent) {
        return {
            'url': '?id=kb_article&sysparm_article=' + kbContent.number,
            'title': gs.getMessage("{0}", kbContent.short_description.getDisplayValue()),
            'shortDescription': '',
            'target': ''
        };
    },

    _convertCatalog: function(catContent) {
        var CONTENT_TYPES = {
            KB: 'kb',
            EXTERNAL: 'external'
        };
        var TYPES = {
            ORDER_GUIDE: 'order_guide',
            CONTENT_ITEM: 'content_item'
        };

        var catalogItemJS = new sn_sc.CatItem(catContent.sys_id);
        var catItemDetails = catalogItemJS.getItemSummary();
        var page = 'sc_cat_item';
        var sys_id = catItemDetails.content_type === CONTENT_TYPES.KB ? catItemDetails.kb_article : catItemDetails.sys_id;
        var target = catItemDetails.content_type === CONTENT_TYPES.EXTERNAL ? '_blank' : '';
        if (catItemDetails.type === TYPES.ORDER_GUIDE) {
            page = 'sc_cat_item_guide';
        } else if (catItemDetails.type === TYPES.CONTENT_ITEM && catItemDetails.content_type === CONTENT_TYPES.KB) {
            page = 'kb_article';
        }

        var pageUrl = catItemDetails.type === TYPES.CONTENT_ITEM && catItemDetails.content_type === CONTENT_TYPES.EXTERNAL ?
            catItemDetails.url : '?id=' + page + '&sys_id=' + sys_id;

        return {
            'url': pageUrl,
            'title': catContent.name.getDisplayValue(),
            'shortDescription': catContent.short_description.getDisplayValue(),
            'target': target
        };
    },

    _convertPage: function(page, quickLink) {
        var queryParams = "";
        for (var name in quickLink.additional_query_params) {
            queryParams += "&" + name + "=" + quickLink.additional_query_params[name];
        }
        return {
            'url': '?id=' + page.id + queryParams,
            'title': page.title.getDisplayValue(),
            'shortDescription': page.short_description.getDisplayValue(),
            'target': ''
        };
    },

    _convertExternalLinks: function(link) {
        return {
            'url': link.url.getDisplayValue(),
            'title': link.title.getDisplayValue(),
            'shortDescription': link.short_description.getDisplayValue(),
            'target': '_blank'
        };
    },

    _convertGuidedHelp: function(guidedHelp, quickLink) {
        return {
            'url': '',
            'title': guidedHelp.name.getDisplayValue(),
            'guided_help': guidedHelp.getUniqueValue(),
            'description': guidedHelp.description.getDisplayValue(),
            'target': ''
        };
    },

    _fetchUserCriteria: function(contentRecord, userCriteriaTable) {
        var gRecord = new GlideRecord(userCriteriaTable);
        gRecord.addQuery(contentRecord.getTableName(), contentRecord.sys_id);
        gRecord.query();
        var criteriaList = [];
        while (gRecord.next()) {
            criteriaList.push(gRecord.user_criteria.sys_id);
        }
        return criteriaList;
    },

    handleGuidedHelpClick: function(guidedHelpId, pageId, source) {
        var guidedHelp = new sn_ex_sp_gd_help.GuidedHelpUtil();
        return guidedHelp.handleGuidedHelpClick(guidedHelpId, pageId, source);
    },

    //Writing own object.assin like function as it is not supported in ECMA Script 5
    mergeObjects: function() {
        var overiddenClone = {};
        for (var index = 0; index < arguments.length; index++) {
            for (var property in arguments[index]) {
                overiddenClone[property] = arguments[index][property];
            }
        }
        return overiddenClone;
    },

    pushNotNull: function(array, value) {
        if (value) {
            array.push(value);
        }
    },

    type: 'QuickLinkUtilSNC'
};
