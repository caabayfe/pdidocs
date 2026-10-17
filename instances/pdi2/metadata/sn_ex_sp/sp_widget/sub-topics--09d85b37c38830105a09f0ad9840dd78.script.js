(function() {
    data.subTopics = [];
    data.offset = 0;
    data.limit = 0;
    data.showMore = false;
    data.lastTopic = true;
    data.showMoreData = gs.getMessage("View all");
    data.isMobileApp = $sp.getParameter('view') === 'mobile';
    data.headingLevel = options.title_heading_level || 'h3';
    var fetchedSubTopics = [];
    data.topicId = (input && input.topic_id) || options.topic_id || $sp.getParameter("topic_id");
    data.subTopicHeader = sn_i18n.Message.getMessage("sn_ex_sp", "{topic_name} topics", {topic_name: getTopicName(data.topicId)});
    data.subTopicsFetchedFromSession = false;
    var urlEnabled = gs.getProperty("sn_ex_sp.enable.image.url.support");

    function getTopicName(topicId) {
        try {
            var topicJs = new sn_taxonomy.Topic(topicId);
            return topicJs.getName();
        } catch (ex) {
            gs.error(gs.getMessage("Invalid Topic Id."));
        }

    }

    // Initial topic fetch on the basis of topic adjustments
    if (input && input.action === "getInitSubTopics") {
        var fetchLimit = input.topicLimit + 2;
        try {
            var topicGr = new GlideRecord('topic');
            if (!topicGr.get(input.topicId)) {
                return;
            }
            var topicPath = topicGr.getValue("topic_path");
            var topicLevel = topicPath ? topicPath.split("/").length - 1 : 0;

            if (topicLevel < 2) {
                var topicServiceUitl = new sn_ex_sp.TopicServiceUtil();
                var menuItems = topicServiceUitl.getTopicsFromSession(topicGr.getValue("taxonomy"));
                if (menuItems) {
                    data.subTopicsFetchedFromSession = true;
                    var topics = menuItems.topicMenuItems.filter(function(topic) {
                        return topic.parent_topic === input.topicId;
                    });
                    data.subTopics = fetchTopicDetails(topics);
                }
            }
            if (!data.subTopicsFetchedFromSession) {
                fetchedSubTopics = fetchSubTopics(input.topicId, 0, fetchLimit);
                if (fetchedSubTopics.length > input.topicLimit) {
                    data.lastTopic = false;
                }
                data.subTopics = fetchedSubTopics;
            }
        } catch (ex) {
            gs.addInfoMessage(gs.getMessage("You are either not authorized or record is not valid."));
        }
    }

    // on click of view all fetching all topics
    if (input && input.action === "viewAll") {
        data.showMore = false;
        data.subTopics = input.subTopics;
        if (!input.lastTopic) {
            fetchedSubTopics = fetchSubTopics(input.topicId, input.offset, 0);
            data.subTopics = data.subTopics.concat(fetchedSubTopics);
        }
    }


    function fetchSubTopics(topicId, startWindow, endWindow) {
        try {
            var topicJs = new sn_taxonomy.Topic(topicId);
            var childTopics = topicJs.getChildTopics(true, data.isMobileApp, endWindow, startWindow);
            topics = fetchTopicDetails(childTopics.topics);
            data.limit = childTopics.limit;
            data.offset = childTopics.offset;
            return topics;
        } catch (ex) {
            gs.error(gs.getMessage("Invalid Topic Id."));
        }

    }

    function fetchTopicDetails(topics) {
        try {
            var topicUtil = new sn_ex_sp.TopicPageUtil();
            for (var i = 0; i < topics.length; i++) {
                if (options.show_topic_icon === 'true') {
                    var icon;
                    if (urlEnabled && urlEnabled === "true")
                        icon = topicUtil.getIcon(topics[i].sys_id);
                    else
                        icon = sn_taxonomy.Topic.getIcon(topics[i].sys_id);

                    if (icon && icon.trim()) {
                        topics[i].icon = icon;
                    } else {
                        topics[i].icon = topicUtil.fetchDefaultIconImage();
                    }
                }
                var pageToRedirect = topics[i].template && topics[i].template.length > 0 ? topics[i].template : 'emp_taxonomy_topic';
                topics[i].link = '?id=' + pageToRedirect + '&topic_id=' + topics[i].sys_id;
                if (data.isMobileApp) {
                    topics[i].link = topics[i].link + '&view=mobile';
                }
            }
            return topics;
        } catch (ex) {
            gs.error(gs.getMessage("Invalid Topic Id."));
        }
    }
})();
