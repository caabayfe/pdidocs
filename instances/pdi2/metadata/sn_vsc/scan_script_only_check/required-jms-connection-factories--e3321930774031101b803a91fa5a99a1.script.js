(function(finding) {
    var pluginManager = new GlidePluginManager();
    var enabledPlugin = pluginManager.isActive('com.snc.runbook_automation.runtime');

    if (enabledPlugin) {
        // Query for MID Server Property mid.property.jms.command.allowed_factory_names
        var gr = new GlideRecord('ecc_agent_property');
        var propQuery = 'name=mid.property.jms.command.allowed_factory_names';
        var defaultValue = 'connectionFactory, queueConnectionFactory, topicConnectionFactory';

        gr.addEncodedQuery(propQuery);
        gr.query();

        // If the property table does exist, check for values outside the default list
        if (gr.next()) {
            var propertyValue = gr.getValue('value');
            var propertyValue2 = propertyValue.split(",");

            for (i = 0; i < propertyValue2.length; i++) {

                if (!defaultValue.includes(propertyValue2[i])) {
                    var grSource = new GlideRecord('ecc_agent_property');
                    grSource.addEncodedQuery(propQuery);
                    grSource.query();
                    if (grSource.next()) {
                      finding.setCurrentSource(grSource);
                    }
                    finding.increment();
                }
            }
        }
    }
})(finding);
