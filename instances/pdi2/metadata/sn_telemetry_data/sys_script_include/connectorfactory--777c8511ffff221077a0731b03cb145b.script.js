var ConnectorFactory = Class.create();
ConnectorFactory.prototype = {
    initialize: function() {
        this.connectors = {};
        // Register default connectors
        this._registerDefaultConnectors();
    },
    /**
     * Registers built-in connectors
     * @private
     */
    _registerDefaultConnectors: function() {
        // Register default connectors here
        // This method can be extended as more connectors are added
        this.registerConnector('telemetry_data', new TelemetryQueryServiceDataConnector());
        this.registerConnector('telemetry_metadata', new TelemetryQueryServiceMetadataConnector());
    },
    /**
     * Registers a connector for a specific data store
     * @param {String} dataStore - The data store name
     * @param {Object} connector - The connector instance
     */
    registerConnector: function(dataStore, connector) {
        if (!dataStore || typeof dataStore !== 'string') {
            gs.error('ConnectorFactory: Invalid dataStore name');
            return;
        }
        if (!connector) {
            gs.error('ConnectorFactory: Connector cannot be null');
            return;
        }
        this.connectors[dataStore] = connector;
    },
    /**
     * Gets a connector for the specified data store
     * @param {String} dataStore - The data store to get a connector for
     * @returns {Object} - The connector instance or null if not found
     */
    getConnector: function(dataStore) {
        if (!dataStore || typeof dataStore !== 'string') {
            gs.error('ConnectorFactory: Invalid dataStore name');
            return null;
        }
        var connector = this.connectors[dataStore];
        if (!connector) {
            gs.warn('ConnectorFactory: No connector registered for dataStore: ' + dataStore);
            return null;
        }
        return connector;
    },

    type: 'ConnectorFactory'
};
