var NotifyFlowStringParamsSNC = Class.create();
NotifyFlowStringParamsSNC.prototype = {

    initialize: function() {
        this._params = {};
        this.initializeJoinConferenceCallSubflow();
        this.initializeJoinConferenceCallviaSMS();
    },

    initializeJoinConferenceCallSubflow: function() {
        this._params.rejoin_conference_call = {

            "code_input_incoming": "Please enter the code of the conference call to join and press hash to finish",

            "conf_call_join_invite_msg": "You have been added to a conference call for {0}. Information about the conference follows, {1}. Press {2} to accept and join the call",

            "conf_call_join_invite": "You have been added to a conference call for {0}. Press {1} to accept and join the call",

            "conf_call_reject": "Press 2 to reject the call",

            "join_conf_call_confirmation": "You will now be joined into the conference call.",

            "good_bye": "Good bye",

            "disconnected_goodbye": "You will now be disconnected. Good bye.",

            "ended_conf_call": "The conference you are trying to join has already ended. Good bye.",

            "incorrect_code_entered": "The code you entered is not valid. You will now be disconnected. Good bye.",

            "sms_body_join_5_inputs": 'You have been added to conference call {0} for {3}. "{4}". To (re)join the conference call, reply with {1} or send it via SMS to {2}.',

            "sms_body_join_4_inputs": 'You have been added to conference call {0} for {3}. To (re)join the conference call, reply with {1} or send it via SMS to {2}.',

            "sms_body_join_3_inputs": 'You have been added to conference call {0}. To (re)join the conference call, reply with {1} or send it via SMS to {2}.',

            "conf_call_not_found": "Application was invoked incorrectly. No conference was provided to add you to."
        };
    },

    initializeJoinConferenceCallviaSMS: function() {
        this._params.join_conference_call_via_sms = {
            "sms_reply_inactive_code": ": Invalid/Inactive Conference Call code."
        };
    },

    getParamsJSONforSubflow: function(subflowName) {
        return this._params[subflowName] ? this._params[subflowName] : {};
    },

    getParamsJSON: function() {
        return this._params;
    },

    type: 'NotifyFlowStringParamsSNC'
};
