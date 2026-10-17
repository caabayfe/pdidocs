(function executeRule(current, previous /*null when async*/ ) {
    var script = `
// Convert the payload in string to escape quotes.
var stringifiedPayload = JSON.stringify(params[0]);

// Escape the characters & < > from the string
var escapedPayload = global.JSUtil.escapeText(stringifiedPayload);

// unescape HTML if escaped already
var unEscapedPayload = GlideStringUtil.unEscapeHTML(escapedPayload);

// parse the strigified Payload
var param = JSON.parse(unEscapedPayload);

var jsonPayload = JSON.parse(param);

var ambChannelName = jsonPayload.ambChannel;
var PAYLOAD = {
    // other parameters should come here.
    skill_id: jsonPayload.payload.skill_id,
    document_id: jsonPayload.payload.document_sys_id,
    document_table: jsonPayload.payload.document_table_name,
    caller: jsonPayload.payload.caller
};
// PAYLOAD.skillConfiguration gives you the skill config record

var CAPABILITY_ID = "<sys_id of sys_one_extend_capability>";

// providing the promptConfigFilter will pick the right promptConfigID from sys_generative_ai_prompt_config
var PROMPT_CONFIG_FILTERS = {
	"key": "value"
};

// Request payload for the capability
var request = {
    "executionRequests": [{
        "payload": PAYLOAD,
		"meta": {
            "configFilters": PROMPT_CONFIG_FILTERS,
			"skillConfigId": PAYLOAD.skill_config_id,
			"source": PAYLOAD.trigger_source,
			"documentId": PAYLOAD.document_sys_id,
			"documentTable": PAYLOAD.document_table_name
		},
		'returnRequest': true,
        "capabilityId": CAPABILITY_ID
    }],
    "mode": "async",
	"ambCallbackChannel": ambChannelName,
	"timeout":20
};

// Call to the OneExtend Capability
var response  = sn_one_extend.OneExtendUtil.executeSecure(request);

if (response.status === sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR) {
    gs.publish(ambChannelName, {
        "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
        "errorMessage": "<message_should_come_here>"
    });
}

answer = {
    success: true,
    message: ""
};`;

    if (!current.script)
        current.script = script;

})(current, previous);
