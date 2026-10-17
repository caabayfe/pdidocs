function transform(input) {
    if (input.nlu_driver == 'Please Select') {
        return;
    }
    var isServiceNowNLU = (input.nlu_driver == 'ServiceNow NLU');
    var properties = [{
            "key": "com.glide.cs.entity_confidence_threshold",
            "value": isServiceNowNLU ? 0.01 : 0.7
        },
        {
            "key": "com.glide.cs.intent_confidence_delta",
            "value": isServiceNowNLU ? 0.0 : 0.5
        },
        {
            "key": "com.glide.cs.intent_confidence_threshold",
            "value": isServiceNowNLU ? 0.01 : 0.1
        }
    ];

    properties.forEach(function(prop) {
        gs.setProperty(prop.key, prop.value);
    });
    return properties;

}
