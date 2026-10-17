var UXADataConnector = Class.create();
UXADataConnector.prototype = {
    initialize: function(uxaDTO) {
        this.uxaDTO = uxaDTO;
    },

    getConnector: function() {
        return new QueryServiceAPI();
    },

    getMetadataConnector: function() {
        return new QueryServiceAPI();
    },

    type: 'UXADataConnector'
};
