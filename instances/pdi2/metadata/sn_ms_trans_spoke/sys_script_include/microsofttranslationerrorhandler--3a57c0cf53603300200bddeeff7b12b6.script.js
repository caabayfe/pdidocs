var MicrosoftTranslationErrorHandler = Class.create();
MicrosoftTranslationErrorHandler.prototype = {
    initialize: function() {},
    detectLanguageHandler: function(errorCode, errorMessage) {
        var standardErrorCode = this.mapDetectLanguageErrorCode(errorCode);
        var standardErrorMessage = this.mapErrorMessage(standardErrorCode, errorMessage);
        return {
            'errorCode': standardErrorCode,
            'errorMessage': standardErrorMessage
        };

    },

    translateTextHandler: function(errorCode, errorMessage) {

        var standardErrorCode = this.mapTranslateTextErrorCode(errorCode);
        var standardErrorMessage = this.mapErrorMessage(standardErrorCode, errorMessage);
        return {
            'errorCode': standardErrorCode,
            'errorMessage': standardErrorMessage
        };
    },

    mapDetectLanguageErrorCode: function(errorCode) {
        if (!errorCode)
            return "40051";

        switch (errorCode) {
            //The field Text must be a string or array type with a maximum length of '10000'
            case 400050:
            case 400077:
                return "40052";
                //The request is not authorized because credentials are missing or invalid
            case 401000:
                return "40055";
            default:
                return "40050";
        }
    },

    mapTranslateTextErrorCode: function(errorCode, errorMessage) {
        if (errorCode) {
            switch (errorCode) {
                //The field Text must be a string or array type with a maximum length of '5000'
                case 400050:
                case 400077:
                    return "40052";
                case 400035:
                    return "40053";
                case 400036:
                    return "40054";
                case 401000:
                    return "40055";
                case 400019:
                case 400023:
                    return "40056";
                default:
                    return "40050";
            }
        } else {
            return "40051";
        }
    },

    mapErrorMessage: function(errorCode, errorMessage) {
        if (errorCode) {
            switch (errorCode) {
                case '40051':
                    return gs.getMessage('Unknown error occurred');
                case '40052':
                    return gs.getMessage('Text has exceeded its maximum length');
                case '40053':
                    return gs.getMessage('Source language is invalid');
                case '40054':
                    return gs.getMessage('Target language is invalid');
                case '40055':
                    return gs.getMessage('Request is not authorized because credentials are missing or invalid');
                case '40056':
                    return gs.getMessage('Text cannot be translated to target languages');
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

    type: 'MicrosoftTranslationErrorHandler'
};
