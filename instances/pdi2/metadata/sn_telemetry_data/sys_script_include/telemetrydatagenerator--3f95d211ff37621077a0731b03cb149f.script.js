var TelemetryDataGenerator = Class.create();
TelemetryDataGenerator.prototype = {
    initialize: function() {},

    generateDAData: function(requestBody) {
        const response = new TelemetryDataHandler().getData(JSON.parse(requestBody));
        return JSON.stringify(response);
    },

    type: 'TelemetryDataGenerator'
};
