executeScript();

function executeScript() {
    if (pm.isZboot())
        return;
    var properties = [{
        name: 'com.snc.problem.create_from_interaction.copy_attachments',
        table: 'problem'
    }, {
        name: 'com.snc.incident.create_from_interaction.copy_attachments',
        table: 'incident'
    }];
    var prevWF = gs.getSession().getWorkflow();
    try {
        gs.getSession().setWorkflow(true);
        properties.forEach(function(property) {
            var propertyValue = gs.getProperty(property.name);
            if (propertyValue !== null) {
                updateNewProperty(propertyValue, property.table);
                deleteOldProperty(property.name);
            }
        });
    } finally {
        gs.getSession().setWorkflow(prevWF);
    }
}

function updateNewProperty(propertyValue, table) {
    var glideProperty = gs.getProperty('com.glide.interaction.attachments.copy');
    if (propertyValue !== 'true') {
        if (glideProperty.includes(table)) {
            glideProperty = glideProperty.replace(table, "").split(",").filter(function(prop) {
                return prop.length > 1;
            }).join();
            gs.setProperty('com.glide.interaction.attachments.copy', glideProperty);
        }
    }
}

function deleteOldProperty(propertyName) {
    var props = new GlideRecord("sys_properties");
    props.addQuery('name', propertyName);
    props.query();
    if (props.next())
        props.deleteRecord();
}
