(
    /**
     * @param {GlideRecord} connector 
     * @returns {void}
     */
    function(connector) {
        new FlowConnectorHelper()
            .sendConnectorToECCQueue(
                connector.getUniqueValue(),
                connector.getTableName()
            );
    }
)(current);
