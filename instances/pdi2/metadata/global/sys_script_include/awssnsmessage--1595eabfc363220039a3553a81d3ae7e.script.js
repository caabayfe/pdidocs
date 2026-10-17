var AWSSNSMessage = Class.create();
AWSSNSMessage.prototype = {
    initialize: function() {
        this.subscribeURLProperty = "evt_mgmt.subscription.URL.Regex";
        this.subscribeURLDefaultValue = "(http:\\/\\/sns\\.|https:\\/\\/sns\\.)?[a-zA-Z0-9-]*\\.amazonaws\\.com\\/\\?Action\\=ConfirmSubscription\\&TopicArn\\=arn\\:aws\\:sns\\:?.*$";
        this.regValue = gs.getProperty(this.subscribeURLProperty, this.subscribeURLDefaultValue);
        this.subscribeURLRegex = new RegExp(this.regValue);

    },

    subscibeAndGetType: function(request, body) {
        var messageType = request.headers["x-amz-sns-message-type"];

       
        if (messageType == "SubscriptionConfirmation") {
            var jsonObject = JSON.parse(body);
            var subscribeURL = jsonObject["SubscribeURL"];
            if (!this.regValue || this.validateSubscribeURL(subscribeURL)) {
                var httpRequest = new GlideHTTPRequest(subscribeURL);
                var subscrResp = httpRequest.get();
                gs.info("Subscription confirmation (" + subscribeURL + ") Return value: " + subscrResp);
            }
        }
        return messageType;
    },

    validateSubscribeURL: function(url) {
        var match = this.subscribeURLRegex.test(url);
        if (!match)
            gs.error("SubscriberUL " + url + " for AWS SubscriptionConfirmation is not matching the regex " + this.subscribeURLRegex.subscribeURLRegex + ". The url is not confirmed");

        return match;

    },

    type: 'AWSSNSMessage'
};
