var unescapedString = GlideStringUtil.unEscapeHTML(params[0]);
var payload = JSON.parse(unescapedString);

gs.publish(payload.ambChannel, {
    'features': {
        "dummyId": {
            'result': {
                'logId': "d9387cd31b624210133e2f46b04bcb4f",
                'response': "Here is the rich text response<br/><ul><li>Coffee</li><li>Tea</li><li>Milk</li></ul>",
                "status": "success"
            },
            "status": "success"
        }
    }
});
