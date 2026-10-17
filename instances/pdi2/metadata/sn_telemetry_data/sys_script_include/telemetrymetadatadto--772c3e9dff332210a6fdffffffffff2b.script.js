var TelemetryMetadataDTO = Class.create();
TelemetryMetadataDTO.prototype = {
    initialize: function() {
        this.dataType = '',
        this.serviceName = '';
    },

    setServiceName: function(serviceName) {
        this.serviceName = serviceName || '';
    },

    getServiceName: function() {
        return this.serviceName;
    },

    setDataType: function(dataType) {
        this.dataType = dataType;
    },

    getDataType: function() {
        return this.dataType;
    },

    toString: function() {
        return JSON.stringify({
            serviceName: this.serviceName,
            dataType: this.dataType
        });
    },

    type: 'TelemetryMetadataDTO'
};
