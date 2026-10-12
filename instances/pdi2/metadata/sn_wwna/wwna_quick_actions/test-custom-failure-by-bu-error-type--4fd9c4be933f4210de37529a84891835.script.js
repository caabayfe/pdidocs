var unescapedString = GlideStringUtil.unEscapeHTML(params[0]);
var payload = JSON.parse(unescapedString);

gs.publish(payload.ambChannel, {
    "status": "error",
    "errorType": "error",
    "errorMessage": "Test Error Message multi line content with early return scenario, Test Error Message multi line content with early return scenario, Test Error Message multi line content with early return scenario"
});
