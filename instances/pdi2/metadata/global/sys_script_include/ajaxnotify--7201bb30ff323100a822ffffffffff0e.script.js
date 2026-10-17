var AjaxNotify = Class.create();
AjaxNotify.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'AjaxNotify',

    getTokens: function() {
        var tokens = '';
        var err = '';
        var notify = new SNC.Notify();

        try {
            var currentUser = new GlideRecord("sys_user");
            currentUser.get(gs.getUserID());
            tokens = notify.getTokens(currentUser);
        } catch(e) {
            tokens = 'null';
            err = e;
            gs.log("Notify: " + e);
        }

        var owner = this.getParameter('sysparm_driver');
        var ttl = notify.getTokenTTL(owner);
        var result = this.newItem("result");
        result.setAttribute("error", err);
        result.setAttribute("ttl", ttl);
        result.setAttribute("tokens", tokens);
    },

    getParentCallId: function() {
        var callId = this.getParameter('sysparm_callId');
        var notify = new SNC.Notify();
        var parentCallId = notify.getParentCallID(callId);
        var result = this.newItem("result");
        result.setAttribute("parentCallId", parentCallId);
    },

    // Registers the user's webRTC session by logging his sys_id.
    registerClientSession: function() {
        var userId = gs.getUserID();
        var isAvailable = this.getParameter('sysparm_available'); // boolean

        // remove any previous user session record
        var rec = new GlideRecord('notify_client_session');
        rec.addQuery('user', userId);
        rec.query();
        while (rec.next()) {
            rec.deleteRecord();
        }

        // create a new user session record
        var gr = new GlideRecord('notify_client_session');
        gr.initialize();
        gr.user = userId;
        gr.available = isAvailable;
        gr.insert();
    },

    deregisterClientSession: function() {
        // remove any previous user session record
        var userId = gs.getUserID();
        var gr = new GlideRecord('notify_client_session');
        gr.addQuery('user', userId);
        gr.query();
        while (gr.next()) {
            gr.deleteRecord();
        }
    },

    setClientAvailable: function() {
        var isAvailable = this.getParameter('sysparm_available'); // boolean
        var gr = new GlideRecord('notify_client_session');
        if (gr.get('user', gs.getUserID())) {
            gr.available = isAvailable;
            gr.update();
        }
    },

    getAvailableClients: function() {
        var notifyNumber = this.getParameter('sysparm_notifyNumber');
        var notify = new SNC.Notify();
        var gr = notify.getAvailableClients(notifyNumber);
        var userId = gs.getUserID();
        var clients = [];
        while (gr.next()) {
            if (gr.user.sys_id != userId) { // filter out the current user
                clients.push({
                    sys_id: gr.user.sys_id + '',
                    name: gr.user.name + ''
                });
            }
        }
        var result = this.newItem("result");
        result.setAttribute("clients", JSON.stringify(clients));
    },

	getOwnerVendor: function () {
		var notifyNumber = this.getParameter('sysparm_notifyNumber');
		var vendor = '';
		var gr = new GlideRecord('notify_number');
		gr.addActiveQuery();
		gr.addQuery('number', notifyNumber);
		gr.query();
		if (gr.next())
			vendor = gr.getValue('owner') + 'Client';
		var result = this.newItem("result");
        result.setAttribute("vendor", vendor);
	},

    forwardCall: function() {
        var callId 		= this.getParameter('sysparm_callSid');
        var phoneNumber = this.getParameter('sysparm_phone_number') || '';
        var clientTable = this.getParameter('sysparm_client_table') || '';
        var clientID 	= this.getParameter('sysparm_client_id') || '';
        var dtmf 		= this.getParameter('sysparm_dtmf') || '';
        var isOutgoing  = this.getParameter('sysparm_is_outgoing') || '';
        var notify 		= new SNC.Notify();

        // get the call record for this call
        var callRecord = new GlideRecord('notify_call');
        callRecord.get('call_id', callId);

        // check if this is an outgoing call
        if (isOutgoing == 'true') {
            // yes, then we should be forwarding the child leg of the call
            var childCallRecord = new GlideRecord('notify_call');
            childCallRecord.query('parent_call', callRecord.getUniqueValue());
            if (childCallRecord.next())
                callRecord = childCallRecord;
        } else {
            // incoming call, forward the parent leg of the call
            if (callRecord.getValue('parent_call').length > 0) {
                // get the parent call record
                var parentCallRecord = new GlideRecord('notify_call');
                if (parentCallRecord.get(callRecord.getValue('parent_call')))
                    callRecord = parentCallRecord;
            }
        }

        // forward the call
        if (phoneNumber !== '') {
            notify.forwardCall(callRecord, phoneNumber, dtmf);
        } else if (clientTable !== '' && clientID !== '') {
            var clientRecord = new GlideRecord(clientTable);
            if (clientRecord.get(clientID)) {
                gs.log(clientRecord);
                notify.forwardCall(callRecord, clientRecord, dtmf);
            } else {
                gs.log('Notify: could not forward call');
            }
        } else {
            gs.log('Notify: could not forward call');
        }
    },

	getNumberDetails: function () {
		var number = this.getParameter('sysparm_number');
		if (number)
			number = number.trim();
		if (number) {
			number = number + '';
			if (number.startsWith('client:')) {
				var idx = number.indexOf('-');
				if (idx > -1)
					return JSON.stringify({userId: number.substring(idx + 1), territory: gs.getMessage("Internet")});
			} else {
				var territory = "";
				var phoneNumber = new GlideElementPhoneNumber();
				var formattedNum = "";
				if (phoneNumber.setPhoneNumber(number, false)) {
					territory = phoneNumber.getTerritory();
					formattedNum = phoneNumber.getGlobalDisplayValue();
				}
				var user = new NotifyUtil().getUserByNumber(number);
				return JSON.stringify({
					number: formattedNum,
					userId: user,
					territory: territory
				});
			}
		}
		return "{}";
	},
});
