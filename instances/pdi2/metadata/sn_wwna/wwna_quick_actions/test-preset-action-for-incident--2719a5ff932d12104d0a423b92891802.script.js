var unescapedString = GlideStringUtil.unEscapeHTML(params[0]);
var payload = JSON.parse(unescapedString);

gs.publish(payload.ambChannel, {
    'features': {
        "dummyId": {
            'result': {
                'logId': "e678b0171b624210133e2f46b04bcbee",
                'response': "Preset Test Response",
                "status": "success"
            },
            "status": "success"
        }
    }
});
