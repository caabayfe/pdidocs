var unescapedString = GlideStringUtil.unEscapeHTML(params[0]);
var payload = JSON.parse(unescapedString);

gs.publish(payload.ambChannel, {
    'features': {
        "dummyId": {
            'result': {
                'logId': "-1",
                'response': "Test Error Message multi line content with LLM failure scenario, Test Error Message multi line content with LLM failure scenario, Test Error Message multi line content with LLM failure scenario.",
            },
            "status": "error"
        }
    }
});
