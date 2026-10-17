var ChangeMessageAPI = Class.create();
ChangeMessageAPI.prototype = {
    initialize: function() {
        this.serverUrl = gs.getProperty('glide.db.clone.instance_clone_server');
    },

    invoke: function(chgNumber, instanceId, message, customerFacing, caller) {
        if (gs.nil(message))
            throw new Error('ChangeMessageAPI cannot be invoked since mandatory parameter "message" is empty');

        if (gs.nil(this.serverUrl))
            throw new Error('ChangeMessageAPI cannot be invoked since endpoint serverUrl is empty.');

		if(gs.nil(gs.getProperty('glide.customurl.datacenter.instance.password', null)))
			throw new Error('ChangeMessageAPI cannot be invoked since no credentials were found.');
		
		if(gs.nil(instanceId))
			instanceId = gs.getProperty('instance_id');
		
        var request = new sn_ws.RESTMessageV2();
        var requestBody = {};
        var serverUrl = this.serverUrl.substring(0, this.serverUrl.lastIndexOf('/'));

        var user = gs.getProperty('instance_id'),
			password = '';
		
		if(!gs.nil(gs.getProperty('glide.customurl.datacenter.instance.password', null)))
			password = GlideStringUtil.base64Encode(gs.getProperty('glide.customurl.datacenter.instance.password', null));

        request.setEndpoint(serverUrl + '/api/snc/chgrequest/postMessage');
        request.setHttpMethod('POST');
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('user', user);
        request.setRequestHeader('password', password);

        requestBody['message'] = message;
        requestBody['customerFacing'] = customerFacing;
        requestBody['callerId'] = caller;
        requestBody['instanceId'] = instanceId;
        requestBody['user'] = user;
        requestBody['password'] = password;

        if (!gs.nil(chgNumber))
            requestBody['chgNumber'] = chgNumber;

        try {
            request.setRequestBody(new JSON().encode(requestBody));
            var response = request.execute();
            return response.getBody();
        } catch (e) {
            throw e;
        }
    },

    type: 'ChangeMessageAPI'
};
