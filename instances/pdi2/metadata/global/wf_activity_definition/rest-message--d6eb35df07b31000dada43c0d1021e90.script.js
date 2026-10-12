// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var REST_MessageActivityHandler = Class.create();
REST_MessageActivityHandler.prototype = Object.extendsObject(WebServiceActivityHandler, {

    initialize: function() {
        WebServiceActivityHandler.prototype.initialize.call(this);
        this.probeId = '5d7d1a9b07d31000dada43c0d1021e99';
        this.capability = 'REST';
        this.executionType = 'rest';
    },

    _getMessageObject: function() {
        return new RESTMessage(this.web_service_message, this.web_service_message_function);
    },

    _getOutput: function() {
        return this.response.getBody();
    },

    _getStatusCode: function() {
        return this.response.getStatusCode();
    },

    _getValues: function() {
        var rm = this.js(activity.vars.rest_message);
        this.web_service_message = '';
        if (!gs.nil(rm)) {
            var rmgr = new GlideRecord('sys_rest_message');
            if (rmgr.get('sys_id', rm))
                this.web_service_message = rmgr.name;
        }

        var rmf = this.js(activity.vars.rest_message_function);
        this.web_service_message_function = '';
        if (!gs.nil(rmf)) {
            var rmfgr = new GlideRecord('sys_rest_message_fn');
            if (rmfgr.get('sys_id', rmf))
                this.web_service_message_function = rmfgr.function_name;
        }

        var rmfgr;
        // Wrap this in a try-catch so if the this.js tries substitution on a REST defined
        // parameter that it can't find as a workflow parameter, we can just take the
        // literal activity endpoint for substitution later
        try {
            this.endpoint = this.js(activity.vars.rest_endpoint);
        } catch(ex) {
            this.endpoint = activity.vars.rest_endpoint;
        }
        if (gs.nil(this.endpoint) && !gs.nil(rmf)) {
            rmfgr = new GlideRecord('sys_rest_message_fn');
            if (rmfgr.get('sys_id', rmf))
                this.endpoint = rmfgr.rest_endpoint;            
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
        } else if (!gs.nil('' + rmfgr.use_mid_server)) {
            this.use_midserver = 'true';
            this.midserver = '' + rmfgr.use_mid_server.name;
        }
    },

    _launch: function() {
        return this.mo.execute();
    },

    _setEndpoint: function() {
        this.mo.setRestEndPoint(this.endpoint);
    },

    type: 'REST_MessageActivityHandler'
});
