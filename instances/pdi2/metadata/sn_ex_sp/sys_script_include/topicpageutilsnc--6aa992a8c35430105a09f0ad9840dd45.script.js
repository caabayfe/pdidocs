var TopicPageUtilSNC = Class.create();
TopicPageUtilSNC.prototype = {
    initialize: function() {
        this.SYS_PROPERTY_ICON = 'sn_ex_sp.default.taxonomy.icon';
    },
    /**
     * Returns the breadcrumbs from topic to its parent
     * @param topicId - sys_id of topic
     * returns the final array having breadcrumb information to display in widget
     **/
    fetchBreadCrumbsForTopic: function(topicId) {
        var breadcrumb = [];
        breadCrumb = this._fetchBreadCrumbsForTopic(topicId, breadcrumb);
        return breadCrumb;
    },

    /**
     * Returns default topic icon image name
     **/
    fetchDefaultIconImage: function() {
        return this._fetchImage(this.SYS_PROPERTY_ICON);
    },

    _fetchBreadCrumbsForTopic: function(topicId, breadcrumb) {
        var parentTopic;
        var gr = new GlideRecord("topic");
        gr.addQuery("active", true);
        gr.addQuery("sys_id", topicId);
        gr.query();
        while (gr.next()) {
            var topicName = gr.getDisplayValue('name');
            var pageToRedirect = gr.getDisplayValue('template') || 'emp_taxonomy_topic';
            breadcrumb.unshift({
                "label": topicName,
                "url": '?id=' + pageToRedirect + '&topic_id=' + topicId + '&in_context=true'
            });
            parentTopic = gr.getValue("parent_topic");
        }
        if (parentTopic != null)
            this._fetchBreadCrumbsForTopic(parentTopic, breadcrumb);

        return breadcrumb;
    },

    _fetchImage: function(sys_property) {
        var image_record = gs.getProperty(sys_property, '');
        var gr = new GlideRecord('db_image');
        gr.addQuery('sys_id', image_record);
        gr.addActiveQuery();
        gr.query();
        if (gr.next())
            return gr.getDisplayValue('image');
        return '';
    },

    getIcon: function(topicId) {
        var gr = new GlideRecord("topic");
        gr.get(topicId);
        if (gr.icon_url)
            return gr.icon_url.toString();
        if (gr.icon)
            return gr.getDisplayValue('icon') + '?t=small';
        return null;
    },

    getBannerImage: function(topicId) {
        var gr = new GlideRecord('topic');
        gr.get(topicId);
        if (gr.banner_image_url)
            return gr.banner_image_url.toString();
        if (gr.banner_image)
            return gr.banner_image.getDisplayValue();
        return null;
    },

    getDBImage: function(imageName) {
        var gr = new GlideRecord('db_image');
        gr.addQuery('name', imageName);
        gr.query();
        if (gr.next() && gr.image)
            return gr.image.toString() + ".iix";
        return null;
    },
    getSearchConfiguration: function(portalSysId, widgetInstanceSysId) {
        var configGR = new GlideRecord('sn_ex_sp_topic_search_configuration');
        configGR.addQuery('portal', portalSysId);
        configGR.addQuery('widget_instance', widgetInstanceSysId);
        configGR.addActiveQuery();
        configGR.orderBy('order');
        configGR.query();
        if (configGR.next()) {
            var searchApplication = configGR.getValue('search_application');
            var searchFilters = configGR.getValue('search_filters') ? configGR.getValue('search_filters').split(',') : [];
            return {
                searchApplication: searchApplication,
                searchFilters: searchFilters
            };
        }
        return null;
    },

    /**
     * Fetches help center topics with icons and links
     * @param taxonomy - The taxonomy string
     * @returns {Array} Array of topics with icon and link properties
     */
    fetchHelpCenterTopics: function(taxonomy) {
        var topics = [];
        try {
            var menuItems = new sn_ex_sp.TopicServiceUtil().getTopicsFromSession(taxonomy);
			if(!gs.nil(menuItems)) {
				topics = menuItems.topicMenuItems.filter(function(topic) {
					return gs.nil(topic.parent_topic);
				});
			}
            else {
                topics = new sn_taxonomy.Taxonomy(taxonomy).getTopics(true, 0, false);
            }

            var urlEnabled = gs.getProperty("sn_ex_sp.enable.image.url.support");
            topics.forEach(function(topic) {
                this._populateTopicDetails(topic, urlEnabled);
            }.bind(this));

        } catch (ex) {
            gs.error(gs.getMessage('Error fetching help center topics: {0}', ex));
        }

        return topics;
    },

    /**
     * Populates additional details for a topic object (icon, link, etc.)
     * @param topic - The topic object to populate with additional details
     */
    _populateTopicDetails: function(topic, urlEnabled) {
        if (gs.nil(topic)) {
            return;
        }
        // Set the icon
        var icon;

        if (urlEnabled && urlEnabled === "true")
            icon = this.getIcon(topic.sys_id);
        else
            icon = sn_taxonomy.Topic.getIcon(topic.sys_id);

        if (icon && icon.trim()) {
            topic.icon = icon;
        } else {
            topic.icon = this.fetchDefaultIconImage();
        }

        // Set the link
        var pageToRedirect = topic.template || 'emp_taxonomy_topic';
        topic.link = '?id=' + pageToRedirect + '&topic_id=' + topic.sys_id;
    },

    type: 'TopicPageUtilSNC'
};
