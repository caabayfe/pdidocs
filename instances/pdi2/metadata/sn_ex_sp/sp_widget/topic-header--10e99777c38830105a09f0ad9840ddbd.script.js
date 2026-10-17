(function() {
    data.breadcrumbs = [];
    data.displayMode = "text_only";
    data.headingLevel = options.title_heading_level || 'h1';

    var BANNER = "banner";
    var ICON = "icon";
    var TEXT_ONLY = "text_only";
    var topicId = (input && input.topic_id) || options.topic_id || $sp.getParameter("topic_id");
    var urlEnabled = gs.getProperty("sn_ex_sp.enable.image.url.support");
    data.isMobileApp = $sp.getParameter('view') === 'mobile';
    fetchTopicHeaderData();
    var portalName = $sp.getPortalRecord().getDisplayValue("title");
    data.windowTitle = gs.getMessage("{0} - {1}", [data.topic.name, portalName]);

    if (data.topic && data.topic.parentTopicId) {
        try {
            var breadcrumbs = new sn_ex_sp.TopicPageUtil().fetchBreadCrumbsForTopic(data.topic.parentTopicId);
            breadcrumbs.push(data.breadcrumbs.pop());
            data.breadcrumbs = breadcrumbs;
        } catch (e) {
            gs.error(e.getMessage());
            gs.addErrorMessage(gs.getMessage("Error occurred, please refer logs for information"));
        }
    }

    data.favoriteWidget = $sp.getWidget('ec_favorite', {
        'table': 'topic',
        'sys_id': topicId,
    });

    function fetchTopicHeaderData() {
        data.topic = {
            "id": topicId,
            "name": gs.getMessage("Employee topic")
        };
        var gr = new GlideRecord("topic");
        gr.addActiveQuery();
        gr.addQuery("sys_id", topicId);
        gr.query();
        if (gr.next()) {
            var topicName = gr.getDisplayValue("name");
            data.topic = {
                "id": topicId,
                "name": topicName,
                "desc": gr.getDisplayValue("description"),
                "icon": "",
                "banner": "",
                "banner_alt_text": gr.getDisplayValue("banner_img_alt_text"),
                "parentTopicId": gr.getValue("parent_topic")
            };
            data.breadcrumbs.unshift({
                "label": topicName,
                "url": "#"
            });

            fetchIconOrBanner();
        }
    }


    function fetchIconOrBanner() {
        var TOPIC_CONTENT_EXPERIENCE_SC = '';
        var TOPIC_CONTENT_EXPERIENCE_CC = '';
        var CEW = '26b2b8cfff02201014c6a36cf43bf1a0';
        var widget_ce_schedule_content = [];
        var widget_ce_campaign_content = [];

        if (new GlidePluginManager().isActive('com.sn_content_delivery')) {
            var gr = new GlideRecord('sn_cd_content_visibility');
            gr.addQuery('topic', 'CONTAINS', topicId);
            gr.addActiveQuery();
            gr.query();
            while (gr.next()) {
                if (gr.sp_instance.sp_widget == CEW) {
                    TOPIC_CONTENT_EXPERIENCE_SC = gr.sp_instance;
                    break;
                }
            }
            widget_ce_schedule_content = sn_cd.cd_ContentDelivery.getContentForWidgetInstance(TOPIC_CONTENT_EXPERIENCE_SC, topicId);
        }

        if (new GlidePluginManager().isActive('com.sn_content_automation')) {
            var gr2 = new GlideRecord('sn_ca_campaign_item');
            gr2.addQuery('topic', 'CONTAINS', topicId);
            gr2.query();
            while (gr2.next()) {
                if (gr2.sp_instance.sp_widget == CEW) {
                    TOPIC_CONTENT_EXPERIENCE_CC = gr2.sp_instance;
                    break;
                }
            }
            if (new GlidePluginManager().isActive('com.sn_content_delivery'))
                widget_ce_campaign_content = sn_cd.cd_ContentDelivery.getContentForWidgetInstance(TOPIC_CONTENT_EXPERIENCE_CC, topicId);
        }

        if (widget_ce_schedule_content.length === 0 && widget_ce_campaign_content.length === 0) {
            if (options.select_topics && options.select_topics.includes(topicId)) {
                fetchIconOrBannerForSelectedTopics();
            } else {
                fetchIconOrBannerForAllTopics();
            }
        } else {
            if (options.select_topics && options.select_topics.includes(topicId)) {
                if (options.secondary_display === ICON) {
                    setIconDisplay();
                    return;
                }
            } else {
                if (options.primary_display === ICON) {
                    setIconDisplay();
                    return;
                }
            }
            setTextOnlyDisplay();
        }
    }

    function fetchIconOrBannerForSelectedTopics() {
        if (options.secondary_display === BANNER) {
            var banner = fetchTopicBanner();
            data.topic.banner = banner;
            data.displayMode = BANNER;
        } else if (options.secondary_display === ICON) {
            setIconDisplay();
        }
    }

    function fetchIconOrBannerForAllTopics() {
        if (options.primary_display === BANNER) {
            var banner = fetchTopicBanner();
            data.topic.banner = banner;
            data.displayMode = BANNER;
        } else if (options.primary_display === ICON) {
            setIconDisplay();
        }
    }

    function setIconDisplay() {
        var icon = fetchTopicIcon();
        if (icon && icon.trim().length > 0) {
            data.topic.icon = icon;
            data.displayMode = ICON;
        } else {
            setTextOnlyDisplay(); //fallback
        }
    }

    function setTextOnlyDisplay() {
        data.displayMode = TEXT_ONLY;
    }

    function fetchTopicBanner() {
        var image;
        if (urlEnabled && urlEnabled === "true")
            image = new sn_ex_sp.TopicPageUtil().getBannerImage(topicId);
        else
            image = sn_taxonomy.Topic.getBannerImage(topicId);
        return image;
    }

    function fetchTopicIcon() {
        var icon;
        if (urlEnabled && urlEnabled === "true")
            icon = new sn_ex_sp.TopicPageUtil().getIcon(topicId);
        else
            icon = sn_taxonomy.Topic.getIcon(topicId);

        if (icon && icon.trim()) {
            return icon;
        }
        return new sn_ex_sp.TopicPageUtil().fetchDefaultIconImage();
    }

})();
