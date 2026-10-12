var CredentialTestAjax = Class.create();

CredentialTestAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	ajaxFunction_testCredential: function() {
		try {
			var credential_data = this.getParameter('sysparm_credential_data');
			var decryptedData = this._decryptCredentialData(credential_data);

			var target = this.getParameter('sysparm_target');
			var port = this.getParameter('sysparm_port');
			var agent = this.getParameter('sysparm_agent');
			var agent_sysId = this.getParameter('sysparm_agent_sysId');

			session.getUser().setPreference('test_credential.target', target);
			session.getUser().setPreference('test_credential.midserver_name', agent);
			session.getUser().setPreference('test_credential.midserver_sysId', agent_sysId);

			var result = SNC.CredentialTest.test(decryptedData, target, port, agent);
			return this._createResult('success', result, '');
		} catch (e) {
			var message = sn_i18n.Message.getMessage('global-discovery', 'Failed to decrypt credentials', {cause: e.message});
			return this._createResult('error', '', message);
		}
	},
	
	ajaxFunction_testCredentialJdbc: function() {
		try {
		    var credential_data = this._decryptCredentialData(this.getParameter('sysparm_credential_data'));
		    var credential_id = this.getParameter('sysparm_credential_id');
		    var target = this.getParameter('sysparm_target');
		    var port = this.getParameter('sysparm_port');
		    var agent = this.getParameter('sysparm_agent');
		    var agent_sysId = this.getParameter('sysparm_agent_sysId');
		    var db_type = this.getParameter('sysparm_db_type');
		    var db_name = this.getParameter('sysparm_db_name');
		    var connection_url = this.getParameter('sysparm_connection_url');
		    var jdbc_driver = this.getParameter('sysparm_jdbc_driver');
		    var use_integrated_authentication = this.getParameter('sysparm_use_integrated_authentication');
	
		    if (!gs.nil(credential_id))
			credential_data = this._getCredentialData(credential_id);
	
		    if (db_type == 'MSSQL' && use_integrated_authentication == "true")
			credential_data = this._getIntegratedAuthCredentialData("jdbc");
	
		    session.getUser().setPreference('test_credential.target', target);
		    session.getUser().setPreference('test_credential.midserver_name', agent);
		    session.getUser().setPreference('test_credential.midserver_sysId', agent_sysId);
	
		    var result = !db_type ?
			SNC.CredentialTest.testCustomDBConnection(credential_data, target, port, agent, connection_url, jdbc_driver) :
			SNC.CredentialTest.testJdbc(credential_data, target, port, agent, db_type, db_name);
	
		    return this._createResult('success', result, '');
		} catch (e) {
		    var message = sn_i18n.Message.getMessage('global-discovery', 'Failed to decrypt credentials', {cause: e.message});
			return this._createResult('error', '', message);
		}
	 },
	
	ajaxFunction_testCredentialJms: function() {
		try {
			var credential_data = this._decryptCredentialData(this.getParameter('sysparm_credential_data'));
			var credential_id = this.getParameter('sysparm_credential_id');
			var target = this.getParameter('sysparm_target');
			var port = this.getParameter('sysparm_port');
			var agent = this.getParameter('sysparm_agent');
			var agent_sysId = this.getParameter('sysparm_agent_sysId');
			var initial_context_factory = this.getParameter('sysparm_initial_context_factory');

			if (!gs.nil(credential_id))
				credential_data = this._getCredentialData(credential_id);

			session.getUser().setPreference('test_credential.target', target);
			session.getUser().setPreference('test_credential.midserver_name', agent);
			session.getUser().setPreference('test_credential.midserver_sysId', agent_sysId);

			var result = SNC.CredentialTest.testJms(credential_data, target, port, agent, initial_context_factory);
			return this._createResult('success', result, '');
		} catch (e) {
			var message = sn_i18n.Message.getMessage('global-discovery', 'Failed to decrypt credentials', {cause: e.message});
			return this._createResult('error', '', message);
		}
	},

	ajaxFunction_testCredentialAws: function() {
	        var credential_id = this.getParameter('sysparm_credential_id');
	        return new AWSCredentialTest(credential_id).run();
	},
	
	ajaxFunction_parseCredentialTestResult: function() {
		var ecc_sys_id = this.getParameter('sysparm_ecc_sys_id');
		var gr = new GlideRecord('ecc_queue');
		if (ecc_sys_id)
			gr.get('sys_id', ecc_sys_id);
		
		var parser = new CredentialTestParser(gr.payload);
		return parser.getResult();
	},
	
	ajaxFunction_checkProgress: function() {
        var agent = this.getParameter('sysparm_agent');
        if (JSUtil.notNil(agent)) {
            // If MID Server is down, bail
            var mid = MIDServer.getByName(agent);
            if (!mid)
                return GlideStringUtil.escapeHTML("error:Could not find MID Server: " + agent);

            if (mid.status !== "Up")
                return GlideStringUtil.escapeHTML("error:MID Server: " + agent + " is not up");

            if (!JSUtil.toBoolean(mid.validated))
                return GlideStringUtil.escapeHTML("error:MID Server: " + agent + " is not validated");
        }

        var ecc_sys_id = this.getParameter('sysparm_ecc_sys_id');
        if (gs.nil(ecc_sys_id)) {
            return "processing";
        }

        var ecc_gr = new GlideRecord('ecc_queue');
        ecc_gr.addQuery('response_to', ecc_sys_id);
        ecc_gr.setLimit(1);
        ecc_gr.query();

        if (!ecc_gr.next())
            return "processing";

        return ecc_gr.sys_id;
    },

	_getCredentialData: function(credSysId){						
			var provider = new sn_cc.StandardCredentialsProvider(); 
			var credential = provider.getCredentialByID(credSysId); 		
			if (gs.nil(credential))
				return "";
		
		var credentialData = {};
		credentialData["user_name"] = credential.getAttribute("user_name");
		credentialData["password"] = credential.getAttribute("password");		
		credentialData["type"] = credential.getAttribute("type");
		
			return JSON.stringify(credentialData);					
	},

	_decryptCredentialData: function(credentialData) {
		var decCredDataObj = {};
		var encCredDataObj = JSON.parse(credentialData);
		for (var key in encCredDataObj) {
			if (!encCredDataObj.hasOwnProperty(key))
				continue;

			var keyObj = encCredDataObj[key];
			if (!keyObj || !keyObj.value)
				continue;

			if (keyObj.decrypt)
				decCredDataObj[key] = SSHPrivateKeyCredentialUtils.decrypt(keyObj.value);
			else
				decCredDataObj[key] = keyObj.value;
		}

		return JSON.stringify(decCredDataObj);
	},
	
	_getIntegratedAuthCredentialData: function(credType) {	
		var credentialData = {};	
		credentialData["type"] = credType;	
		credentialData["use_integrated_authentication"] = true;	
		return JSON.stringify(credentialData);	
	},

	_createResult: function(status, answer, errorMessage) {
		return JSON.stringify({
			status: status,
			sys_id: answer,
			message: errorMessage
		});
	},
	
	type: 'CredentialTestAjax'
});
