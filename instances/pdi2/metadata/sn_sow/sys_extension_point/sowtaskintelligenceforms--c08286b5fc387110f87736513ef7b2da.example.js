
		var SOWTaskIntelligenceForms = Class.create();
SOWTaskIntelligenceForms.prototype = {
    initialize: function() {},

    //sample code for implementation
    //Function to return if the specific feature is enable
    //Example:  will return PROP_CHAT_SUMMARIZATION_ENABLED
    isFeatureEnabled: function() {
        return true;
    },

    //Function to return the dictionary of predicted fields for a specific record 
    getPredictions: function( /*String*/ sysId, /*String*/ tableName) {
        var predictionsDict = {};
        var prediction = {
            'predictedField': predictedField,
            'predictedFieldlabel': predictedFieldlabel,
            'predictedValue': predictedValue,
            'predictedDisplayValue': predictedDisplayValue,
            'recommendations': [{ //optional 
                    "value": "recommendation1_key",
                    DisplayValue: "recommendation 1"
                },
                {
                    "value": "recommendation2_key",
                    DisplayValue: "recommendation 2 "
                }
            ],
            'implementationPlan': implementationPlan, //autofill by default - look for values in SOWTaskIntelligenceForms.IMPLEMENTATION_PLANS
            'message': "message to display if UI16",
            'iconDescription': "Description to display as help on the icon",
            'displayBanner': "true", //true or false to indicate if banner should be displayed for the prediction
			'fieldsToMonitor' : [] //fields to monitor to display the AI icon
        };

        predictionsDict["prefictedField"] = prediction;
        return predictionsDict;
    }, 

    type: 'SOWTaskIntelligenceForms'
};
