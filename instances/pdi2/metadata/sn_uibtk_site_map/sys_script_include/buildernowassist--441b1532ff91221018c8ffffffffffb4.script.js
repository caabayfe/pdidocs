var BuilderNowAssist = Class.create();
BuilderNowAssist.prototype = {
    initialize: function() {},

    cleanTextInput: function(text) {
        if (gs.nil(text)) {
            return text;
        }

        return text.toString().trim();
    },

    getUserRequestWithContext: function(userRequest) {
        let cleanRequest = this.cleanTextInput(userRequest);

        if (gs.nil(cleanRequest)) {
            return cleanRequest;
        }

        if (cleanRequest.indexOf('UI Builder') < 0) {
            cleanRequest = `In UI Builder, ${cleanRequest}`;
        }

        return cleanRequest;
    },

    getRequestPromptMessage: function(context) {
        if (gs.nil(context)) {
            return gs.getMessage("For better results, include what you're working on and specify the feature or component you're using.");
        }

        if (gs.nil(context.aisResponse)) {
            return gs.getMessageLang("For better results, include what you're working on and specify the feature or component you're using.", context.requesterLang);
        }

        return gs.getMessageLang('If you still need help with this, try rephrasing your question or ask a new one.', context.requesterLang);
    },

    type: 'BuilderNowAssist'
};
