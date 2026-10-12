var AbstractAppseeServiceHttpClient = Class.create();
AbstractAppseeServiceHttpClient.prototype = {
    initialize: function() {
        this.logger = QueryServiceApiLogger.getLogger('AbstractAppseeServiceHttpClient');
    },

    doGet: function() {
        this.logger.warn('Not Implemented');
    },

    doPost: function(payload) {
        this.logger.warn('Not Implemented');
    },

    addHeader: function(key, value) {
        this.logger.warn('Not Implemented');
    },

    type: 'AbstractAppseeServiceHttpClient'
};
