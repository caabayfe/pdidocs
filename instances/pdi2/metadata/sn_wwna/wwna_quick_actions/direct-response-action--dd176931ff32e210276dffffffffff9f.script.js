var unescapedString = GlideStringUtil.unEscapeHTML(params[0]);
var payload = JSON.parse(unescapedString);

gs.publish(payload.ambChannel, {
    "status": "success",
    "logId": "123123123123",
	"messageForDialog": "Testing 123",
    "successMessage": "Testing component with direct publishing"
});
