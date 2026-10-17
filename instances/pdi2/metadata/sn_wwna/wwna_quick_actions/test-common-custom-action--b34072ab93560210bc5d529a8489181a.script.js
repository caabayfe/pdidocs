var unescapedString = GlideStringUtil.unEscapeHTML(params[0]);
var payload = JSON.parse(unescapedString);

gs.publish(payload.ambChannel, {
    'features': {
        "dummyId": {
            'result': {
                'logId': "9f68b0171b624210133e2f46b04bcb3a",
                'response': "Common Test Response",
                "status": "success"
            },
            "status": "success"
        }
    }
});
