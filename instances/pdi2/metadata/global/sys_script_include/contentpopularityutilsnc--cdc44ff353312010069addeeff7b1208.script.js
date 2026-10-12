var ContentPopularityUtilSNC = Class.create();
ContentPopularityUtilSNC.prototype = {
    initialize: function() {
        this.contentConfigs = [];
        this.contentProcessors = {};

        var extensions = new GlideScriptedExtensionPoint().getExtensions(TaxonomyConstants.CONTENT_SCRIPTED_EXTENSION_POINT);
        var contentConfigGr = new ContentConfigUtil().getContentConfigGr();
        while (contentConfigGr.next()) {
            if (contentConfigGr.getValue('connected_content_table') == 'm2m_connected_content') {
                var contentConfig = {
                    contentTable: contentConfigGr.getValue("content_table"),
                    sortField: contentConfigGr.getValue("sort_field"),
                    contentReferenceField: contentConfigGr.getValue("content_reference_field"),
                    displayFilter: contentConfigGr.getValue("content_filter"),
                    contentConfigSysId: contentConfigGr.getUniqueValue()
                };
                this.contentConfigs.push(contentConfig);

                for (var i = 0; i < extensions.length; i++) {
                    var ep = extensions[i];
                    var extensionTableName = ep.getTableName();
                    if (extensionTableName == contentConfig.contentTable) {
                        this.contentProcessors[contentConfig.contentTable] = extensions[i];
                        break;
                    }
                }
            }
        }
    },

    populateOrderOfContent: function() {
        this.populateOrder();
        this.populatePopularity();
    },

    populateOrder: function() {
        var content = [];
        this.contentConfigs.forEach(function(contentConfig) {
            var gr = new GlideRecord('m2m_connected_content');
            gr.addQuery('content_type', contentConfig.contentConfigSysId);
            gr.addEncodedQuery(contentConfig.displayFilter);
            gr.query();
            while (gr.next()) {
                var displayValue = '';
                var contentRecord = gr[contentConfig.contentReferenceField].getRefRecord();
                if (contentRecord.isValidRecord())
                    displayValue = contentRecord.getValue(contentConfig.sortField);
                if (displayValue)
                    content.push([gr.getUniqueValue(), displayValue.trim()]);
            }
        });

        // Sort alphabetically
        content.sort(function(a, b) {
            var item1 = a[1].toLowerCase();
            var item2 = b[1].toLowerCase();
            if (item1 < item2)
                return -1;
            if (item1 > item2)
                return 1;
            return 0;
        });

        var order = 1;
        content.forEach(function(item) {
            var gr = new GlideRecord('m2m_connected_content');
            gr.get(item[0]);
            gr.setValue('alphabetical_order', order++);
            gr.update();
        });
    },

    populatePopularity: function() {
        var calculatePopularity = this.getPopularityAlgorithm();
        calculatePopularity.call(this);
    },

    getPopularityAlgorithm: function() {
        return this.zScoreAlgorithm;
    },

    zScoreAlgorithm: function() {
        var self = this;
        this.contentConfigs.forEach(function(contentConfig) {
            var items = [];
            var gr = new GlideRecord('m2m_connected_content');
            gr.addQuery('content_type', contentConfig.contentConfigSysId);
            gr.addEncodedQuery(contentConfig.displayFilter);
            gr.query();
            while (gr.next()) {
                if (items.indexOf(gr.getValue(contentConfig.contentReferenceField)) == -1)
                    items.push(gr.getValue(contentConfig.contentReferenceField));
            }
            var contentProcessor = self.contentProcessors[contentConfig.contentTable];
            var popularityMap = contentProcessor.getPopularity(items.toString());
            var popularityOfItems = [];
            Object.keys(popularityMap).forEach(function(key) {
                popularityOfItems.push(popularityMap[key]);
            });
            var mean = self.getMean(popularityOfItems);
            var sd = self.getStandardDeviation(popularityOfItems, mean);
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                var popularity = popularityMap.hasOwnProperty(item) ? popularityMap[item] : 0;
                popularity = self.getZScore(popularity, mean, sd);
                var connectedContentGr = new GlideRecord('m2m_connected_content');
                connectedContentGr.addQuery(contentConfig.contentReferenceField, item);
                connectedContentGr.query();
                connectedContentGr.setValue('popularity', popularity);
                connectedContentGr.updateMultiple();
            }
        });
    },

    getZScore: function(value, mean, sd) {
        var score = 0;
        if (sd > 0)
            score = (value - mean) / sd;
        return score;
    },

    getMean: function(arr) {
        var sum = 0;
        arr.forEach(function(i) {
            sum += i;
        });
        return sum / arr.length;
    },

    getStandardDeviation: function(arr, mean) {
        var sd = 0;
        arr.forEach(function(i) {
            sd += Math.pow(i - mean, 2);
        });
        return Math.sqrt(sd / arr.length);
    },

    type: 'ContentPopularityUtilSNC'
};
