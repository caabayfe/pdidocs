// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var SOAP_MessageActivityHandler = Class.create();
SOAP_MessageActivityHandler.prototype = Object.extendsObject(WebServiceActivityHandler, {

    initialize: function() {
        WebServiceActivityHandler.prototype.initialize.call(this);
        this.probe = 'a152c4d40a0a0b5e009be973b683d69e';
        this.capability = 'SOAP';
        this.soap_message = '';
        this.soap_message_function = '';
        this.soap_endpoint = '';
        this.executionType = 'soap';
    },

    _hasOtherErrors: function() {
        return this._hasSoapFault();
    },

    _hasSoapFault : function() {
        var XMLUtil = GlideXMLUtil;
        var responseXML = XMLUtil.parse(this.response);

		if (!responseXML) {
			var errorStr = gs.getMessage('There is no response from the target server.  The endpoint may not be reachable.');
            this.setResultFailed(errorStr);
            workflow.error(errorStr);			
			return true;
		}
		
        var fault = XMLUtil.getElementByTagName(responseXML, 'SOAP-ENV:Fault');

        if (fault) {
            var faultString = XMLUtil.getElementValueByTagName(responseXML, 'faultstring');
            var errorStr = 'SOAP fault detected in response: ' + faultString;
            this.setResultFailed(errorStr);
            workflow.error(errorStr);
            return true;
        }

        return false;
    },

    _getHttpStatus: function() {
    },

    _getMessageObject: function() {
        return new SOAPMessage(this.web_service_message, this.web_service_message_function);
    },

    _getOutput: function() {
        return this.response;
    },

    _getStatusCode: function() {
        return this.mo.getHttpStatus();
    },

    _getValues: function() {
        var sm = this.js(activity.vars.soap_message);
        this.web_service_message = '';
        if (!gs.nil(sm)) {
            var smgr = new GlideRecord('sys_soap_message');
            if (smgr.get('sys_id', sm))
                this.web_service_message = smgr.name;
        }

        var smf = this.js(activity.vars.soap_message_function);
        this.web_service_message_function = '';
        if (!gs.nil(smf)) {
            var smfgr = new GlideRecord('sys_soap_message_function');
            if (smfgr.get('sys_id', smf))
                this.web_service_message_function = smfgr.function_name;
        }

        this.endpoint = this.js(activity.vars.soap_endpoint);
        if (gs.nil(this.endpoint) && !gs.nil(smf)) {
            var smfgr = new GlideRecord('sys_soap_message_function');
            if (smfgr.get('sys_id', smf))
                this.endpoint = smfgr.soap_endpoint;            
        }

        this.variables = this.js(activity.vars.variables);
        this.use_midserver = this.js(activity.vars.use_midserver);

        if (this.use_midserver != 'false') {
            var mid = this.js(activity.vars.midserver);
            this.midserver = '';
            if (mid) {
                var midgr = new GlideRecord('ecc_agent');
                midgr.addQuery('sys_id', mid);
                midgr.query();
                if (midgr.next())
                    this.midserver = midgr.name;
            }
        } else if (!gs.nil('' + smfgr.use_mid_server)) {
            this.use_midserver = 'true';
            this.midserver = '' + smfgr.use_mid_server.name;
        }
    },

    _launch: function() {
        return this.mo.post();
    },

    _processValues: function() {
        if (JSUtil.nil(this.web_service_message) && !JSUtil.nil(this.soap_message)) {
            workflow.debug('Setting soap message: ' + this.soap_message);
            this.web_service_message = this.soap_message;
        }
    
        if (JSUtil.nil(this.web_service_message_function) && !JSUtil.nil(this.soap_message_function)) {
            workflow.debug('Setting soap message function: ' + this.soap_message_function);
            this.web_service_message_function = this.soap_message_function;
        }

        if (JSUtil.nil(this.endpoint) && !JSUtil.nil(this.soap_endpoint)) {
            workflow.debug('Setting endpoint: ' + this.soap_endpoint);
            this.endpoint = this.soap_endpoint;
        }
    },

    _setEndpoint: function() {
        this.mo.setSoapEndPoint(this.endpoint);
    },

    type: 'SOAP_MessageActivityHandler'
});
