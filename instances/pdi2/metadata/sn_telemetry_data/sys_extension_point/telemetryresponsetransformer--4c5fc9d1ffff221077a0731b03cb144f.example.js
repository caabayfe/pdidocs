var TelemetryResponseTransformer = Class.create();
TelemetryResponseTransformer.prototype = {
    initialize: function() {},

    transform: function(data, telemetryDTO) {
        data.push("new entry");
        return data;
    },

    type: 'TelemetryResponseTransformer'
};
