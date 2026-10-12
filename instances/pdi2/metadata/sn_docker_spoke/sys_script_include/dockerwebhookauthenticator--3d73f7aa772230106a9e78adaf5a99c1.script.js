var DockerWebhookAuthenticator = Class.create();
DockerWebhookAuthenticator.prototype = {
    initialize: function(params) {
		//ni.nolog prefix is used to prevent the query params from being logged at Load Balancer
        this.id = params['ni.nolog.id'].toString();
        this.token = params['ni.nolog.token'].toString();
    },

	authenticate: function() {
        if (this._isTokenAbsent()) {
            return this._prepareTokenMissingResponse();
        }
        return this._checkWebhookRegistration();
    },

    _isTokenAbsent: function() {
        return !this.id || !this.token;
    },

    _checkWebhookRegistration: function() {
        var response = {};
        var token = decodeURIComponent(this.token);
        var registry = new GlideRecord("sn_docker_spoke_docker_webhook_registry");
        if (registry.get(this.id)) {
            response = (token != registry.token.token.toString()) ? this._prepareTokenMismatchResponse() : this._prepareAuthSuccessResponse();
        } else {
            response = this._prepareUnRegisteredWebhookResponse(this.id);
        }
        return response;
    },

    _prepareTokenMissingResponse: function() {
        gs.error("id or token of webhook is not present");
        var response = {};
        response.status = "failure";
        response.errorMessage = "id or token of webhook is not present";
        response.statusCode = 400;
        return response;
    },

    _prepareUnRegisteredWebhookResponse: function(id) {
        gs.error("Webhook with id: " + id + " is not registered");
        var response = {};
        response.status = "failure";
        response.errorMessage = "Webhook with id: " + id + " is not registered";
        response.statusCode = 400;
        return response;
    },

    _prepareTokenMismatchResponse: function() {
        gs.error("Bad token");
        var response = {};
        response.status = "failure";
        response.errorMessage = "Bad token";
        response.statusCode = 401;
        return response;
    },

    _prepareAuthSuccessResponse: function() {
        var response = {};
        response.status = "success";
        response.statusCode = 200;
        return response;
    },
	
    type: 'DockerWebhookAuthenticator'
};
