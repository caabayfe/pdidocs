var TopicPopularityUtilSNC = Class.create();
TopicPopularityUtilSNC.prototype = {
    initialize: function() {
        this.TOPIC_TABLE = 'topic';
        this.TOPIC_METRICS_TABLE = 'sn_ex_sp_topic_metric';
        this.CONTENT_TABLE = 'm2m_connected_content';
        this.SUM_COEFFICIENT = gs.getProperty('sn_ex_sp.topic.totalPopularity.weight');
        this.COUNT_COEFFICIENT = gs.getProperty('sn_ex_sp.topic.numberOfContent.weight');
        //Sys Ids for catalog items, knowledge articles content types
        this.CONTENT_TYPE_FILTERS = '4c32a92153622010069addeeff7b12a3,98f9a16553622010069addeeff7b1248';
        this.contentConfigMap = this._getContentConfigMap();
    },

    _getContentConfigMap: function() {
        var contentConfigMap = {};
        var contentTypeFilterArr = this.CONTENT_TYPE_FILTERS.split(',');
        contentTypeFilterArr.forEach(function(contentType) {
            var contentConfigMapGr = new GlideRecord('taxonomy_content_configuration');
            if (contentConfigMapGr.get(contentType)) {
                contentConfigMap[contentType] = contentConfigMapGr.getValue('content_filter');
            }
        });
        return contentConfigMap;
    },

    _getPopularityParamsFromContent: function(topicId) {
        var sum = 0;
        var count = 0;

        for (var contentType in this.contentConfigMap) {
            if (this.contentConfigMap.hasOwnProperty(contentType)) {
                var contentGa = new GlideAggregate(this.CONTENT_TABLE);
                contentGa.addQuery('topic', topicId);
                contentGa.addQuery('content_type', contentType);
                contentGa.addEncodedQuery(this.contentConfigMap[contentType]);
                contentGa.setGroup(false);
                contentGa.addAggregate('SUM', 'popularity');
                contentGa.addAggregate('COUNT');
                contentGa.query();
                if (contentGa.next()) {
                    if (contentGa.getAggregate('SUM', 'popularity')) {
                        sum = sum + (+contentGa.getAggregate('SUM', 'popularity'));
                    }
                    if (contentGa.getAggregate('COUNT')) {
                        count = count + (+contentGa.getAggregate('COUNT'));
                    }
                }
            }
        }
        var popularityParametersObj = {};
        popularityParametersObj.totalPopularity = sum;
        popularityParametersObj.count = count;
        popularityParametersObj.topic = topicId;
        return popularityParametersObj;
    },

    /* Popularity of a topic is a heuristic approach and calculation is based on regression. Given the two variables total popularity and number of content items, popularity is a weighted sum of the variables. weight A * sum + weight B * count.  */

    _calculatePopularity: function(sum, count) {
        return (this.SUM_COEFFICIENT * sum) + (this.COUNT_COEFFICIENT * count);
    },
    _updateTopicPopularity: function(popularityParametersArr) {
        popularityParametersArr.forEach(function(item) {
            var popularityValue = 0;
            if (item.count > 0)
                // passing total popularity from content items and count as they are the two variables affecting popularity for a topic
                popularityValue = this._calculatePopularity(item.totalPopularity, item.count);

            var gr = new GlideRecord(this.TOPIC_METRICS_TABLE);
            if (gr.get('topic', item.topic)) {
                gr.setValue('popularity', popularityValue);
                gr.setValue('topic', item.topic);
                gr.update();
            } else {
                gr.initialize();
                gr.setValue('popularity', popularityValue);
                gr.setValue('topic', item.topic);
                gr.insert();
            }
        }, this);
    },

    /* populatePopularity: Gets all the topics, calculates the popularity of each by aggregating the popularity values of its content  */

    populatePopularity: function() {
        var popularityParametersArr = [];
        var gr = new GlideRecord(this.TOPIC_TABLE);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var topicId = gr.getUniqueValue();
            var topicPopularityParams = this._getPopularityParamsFromContent(topicId);
            if (!isNaN(topicPopularityParams.count)) {
                popularityParametersArr.push(topicPopularityParams);
            }
        }
        this._updateTopicPopularity(popularityParametersArr);
    },
    type: 'TopicPopularityUtilSNC'
};
