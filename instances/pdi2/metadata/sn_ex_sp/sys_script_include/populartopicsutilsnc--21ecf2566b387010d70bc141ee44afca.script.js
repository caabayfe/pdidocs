var PopularTopicsUtilSNC = Class.create();
PopularTopicsUtilSNC.prototype = {
    initialize: function() {
        this.popularTopicsIndex = {};
        this.defaultRedirectionPage = 'emp_taxonomy_topic';
        this.URL_ENABLED = gs.getProperty("sn_ex_sp.enable.image.url.support");
        this.EMPLOYEE_CENTER_CACHE = 'employee_center_cache';
        this.userID = gs.getUserID();
    },

    /**
     * Returns default topic icon image name
     **/
    _fetchDefaultIconImage: function() {
        return new TopicPageUtil().fetchDefaultIconImage();
    },

    /**
     * Return image's url if available, otherwise return the image (uploaded or default)
     */
    _getImage: function(url, image, size, defaultImage) {
        if (this.URL_ENABLED && this.URL_ENABLED === "true" && url)
            return url;
        if (image) {
            if (size)
                return image + '?t=' + size;
            return image;
        }
        return defaultImage;
    },

    /**
     * Returns popular topics
     * @param taxonomyId
     * @param limit: the number of topics
     * @param isMobile
     * @param instanceId
     **/
    getPopularTopics: function(taxonomy, limit, isMobile, instanceId, statsParentId) {
        var stats = {};
        stats.callerId = instanceId;
        stats.callerTable = instanceId ? 'sp_instance' : '';
        stats.parentId = statsParentId;
        stats.textPrefix = 'Get Popular Topics';
        stats.userId = gs.getUserID();
        var performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();

        var popularTopics = [];
        var popularTopicsIds = [];
        var topicAccessData = {};
        var noOfItems = 0;
        var cacheKey = 'topicMetric' + taxonomy;
        var topicCacheKey = 'topicAccess' + taxonomy;
        var topicMetricsFromCache = sn_scoped_cache.ScopedCacheManager.get(this.EMPLOYEE_CENTER_CACHE, cacheKey);
        if (topicMetricsFromCache) {
            topicMetrics = JSON.parse(topicMetricsFromCache);
            popularTopicsIds = topicMetrics[cacheKey];
            topicAccessData = topicMetrics[topicCacheKey];
        } else {
            var topicMetricGr = new GlideRecord('sn_ex_sp_topic_metric');
            topicMetricGr.addQuery('topic.taxonomy', taxonomy);
            topicMetricGr.addQuery('topic.active', true);
            topicMetricGr.orderByDesc('popularity');
            topicMetricGr.orderBy('topic.order');
            topicMetricGr.orderBy('topic.name');
            topicMetricGr.query();
            while (topicMetricGr.next()) {
                var topic = topicMetricGr.topic;
                if (topic.enable_user_criteria_check) {
                    var topicUserCriteriaData = {};

                    topicAccessData[topic] = {
                        enable_user_criteria_check: topic.enable_user_criteria_check.toString(),
                        available_for: topic.available_for.toString(),
                        not_available_for: topic.not_available_for.toString()
                    };
                }
                popularTopicsIds.push(topic.toString());
            }
            var topicMetricsToBeCached = {};
            topicMetricsToBeCached[cacheKey] = popularTopicsIds;
            topicMetricsToBeCached[topicCacheKey] = topicAccessData;
            sn_scoped_cache.ScopedCacheManager.put(this.EMPLOYEE_CENTER_CACHE, cacheKey, JSON.stringify(topicMetricsToBeCached));
        }

        var megaMenuTopics = null;

        var topicServiceUtil = new sn_ex_sp.TopicServiceUtil();
        var menuItems = topicServiceUtil.getTopicsFromSession(taxonomy);
        if (menuItems) {
            megaMenuTopics = menuItems.topicMenuItems;
        }

        for (var index = 0; index < popularTopicsIds.length && noOfItems < limit; index++) {
            stats.startTime = new GlideDateTime();
            var canView;
            var topicId = popularTopicsIds[index];

            var topicGr = new GlideRecord('topic');
            if (!topicGr.get(topicId)) {
                continue;
            }
            var topicPath = topicGr.getValue("topic_path");
            var topicLevel = topicPath ? topicPath.split("/").length - 1 : 0;

            if (megaMenuTopics && topicLevel <= 2) {
                canView = megaMenuTopics.some(function(topic) {
                    return topic.sys_id === topicId;
                });
            } else {
                if (topicAccessData && topicAccessData[topicId] && topicAccessData[topicId].enable_user_criteria_check == 'true') {
                    canView = this.checkCurrentUserAccessForTopic(topicAccessData[topicId]);
                } else {
                    if (!GlidePluginManager.isActive('com.glideapp.knowledge.i18n2'))
                        canView = new TopicSecurityUtil().canViewTopic(topicId, false);
                    else
                        canView = new TopicSecurityUtil().canViewTopicAdvanced(topicId, false);
                }
            }

            if (canView) {
                var pageToRedirect = topicGr.template ? topicGr.getDisplayValue('template') : this.defaultRedirectionPage;
                popularTopics.push({
                    topic: topicGr.getDisplayValue('name'),
                    topicId: popularTopicsIds[index],
                    icon: this._getImage(topicGr.icon_url.toString(), topicGr.getDisplayValue('icon'), 'small', this._fetchDefaultIconImage()),
                    topicUrl: '?id=' + pageToRedirect + '&topic_id=' + popularTopicsIds[index]
                });
                this.popularTopicsIndex[popularTopicsIds[index]] = true;
                noOfItems++;

            }
            stats.refTable = "topic";
            stats.refRecordId = popularTopicsIds[index];
            stats.shortDesc = "Can view topic - ".concat(popularTopicsIds[index]);
            performanceIndicatorUtil.postHotspot(stats);
        }

        return popularTopics;
    },

    /**
     * Check Current Users Access for Topic
     * @returns boolean
     */
    checkCurrentUserAccessForTopic: function(userCriteriaData) {
        if (userCriteriaData.not_available_for) {
            var not_available_for = userCriteriaData.not_available_for.toString().split(',');
            if (sn_uc.UserCriteriaLoader.userMatches(this.userID, not_available_for)) {
                return false;
            }
        }
        if (userCriteriaData.available_for) {
            var available_for = userCriteriaData.available_for.toString().split(',');
            if (sn_uc.UserCriteriaLoader.userMatches(this.userID, available_for)) {
                return true;
            }
        }
        return false;
    },
    type: 'PopularTopicsUtilSNC'
};
