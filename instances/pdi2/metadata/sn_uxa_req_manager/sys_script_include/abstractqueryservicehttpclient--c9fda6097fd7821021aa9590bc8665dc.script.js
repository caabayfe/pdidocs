var AbstractQueryServiceHttpClient = Class.create();
AbstractQueryServiceHttpClient.prototype = {
    initialize: function() {
        this.logger = QueryServiceApiLogger.getLogger('AbstractQueryServiceHttpClient');
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

    type: 'AbstractQueryServiceHttpClient'
};
