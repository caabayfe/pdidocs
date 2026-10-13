var ServiceNowLDSErrorHandler = Class.create();
ServiceNowLDSErrorHandler.prototype = {
    initialize: function() {},

    detectLanguageHandler: function(errorMessage) {
        var standardErrorCode = this.mapDetectLanguageErrorCode(errorMessage);
        var standardErrorMessage = this.mapErrorMessage(standardErrorCode, errorMessage);
        return {
            'errorCode': standardErrorCode,
            'errorMessage': standardErrorMessage
        };
    },

    mapDetectLanguageErrorCode: function(errorMessage) {
        if (errorMessage) {
            switch (true) {
                case /batch predictions cannot be greater than.*/i.test(errorMessage):
                    return '40052';
                default:
                    return '40050';
            }
        } else {
            return '40051';
        }
    },

    mapErrorMessage: function(errorCode, errorMessage) {
        if (errorCode) {
            switch (errorCode) {
                case '40051':
                    return gs.getMessage('Unknown error occurred');
                case '40052':
                    return gs.getMessage('Text has exceeded its maximum length');
                default:
                    return gs.getMessage(errorMessage);
            }
        } else {
            return gs.getMessage('Unknown error occurred');
        }
    },

    getTimeoutValue: function() {
        return parseInt(gs.getProperty('glide.dynamic.translation.default.timeout', 40000));
    },

    type: 'ServiceNowLDSErrorHandler'
};
