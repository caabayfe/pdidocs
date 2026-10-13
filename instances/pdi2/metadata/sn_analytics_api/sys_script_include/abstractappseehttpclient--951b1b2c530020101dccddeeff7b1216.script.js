var AbstractAppseeHttpClient = Class.create();
AbstractAppseeHttpClient.prototype = {
    initialize: function() {
        this.logger = AnalyticsApiLogger.getLogger('AbstractAppseeHttpClient');
    },

    doGet: function() {
        this.logger.warn('Not Implemented');
    },

    doPost: function(payload) {
        this.logger.warn('Not Implemented');
    },

    doPut: function(payload) {
        this.logger.warn('Not Implemented');
    },

    doDelete: function(payload) {
        this.logger.warn('Not Implemented');
    },

    doPatch: function(payload) {
        this.logger.warn('Not Implemented');
    },

    addHeader: function(key, value) {
        this.logger.warn('Not Implemented');
    },

    type: 'AbstractAppseeHttpClient'
};
