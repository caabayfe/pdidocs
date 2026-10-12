(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var chat_channel_id = 'ea0cb816732110104a905ee515f6a7b5';
	var channel_id = request.body.data.channel_id;
    var provider_id = request.body.data.provider_id;
    var provider_number = request.body.data.provider_number;
    var to_number = request.body.data.to_number;
    var message = request.body.data.message;
    var profile_table = request.body.data.profile_table;
    var profile_sysid = request.body.data.profile_sysid;
    var attachment_sysid = request.body.data.attachment_sysid;
	var res = {};

	if (channel_id == chat_channel_id) {
		res = new global.AJAXMessagingUtils().sendAsyncChat(to_number, message, attachment_sysid);
	} else {
		res = new global.AJAXMessagingUtils().sendMessage(provider_id, provider_number, to_number, message, profile_table, profile_sysid, attachment_sysid);
	}
	response.setBody(JSON.parse(res));
})(request, response);
