var LOG_PREFIX = '[Metric Intelligence]';
var PROPERTY = 'metric_name_analysis.add_detected_constant_candidate';

gs.info('{0}: Enabling detected constant model via {1} property', [LOG_PREFIX, PROPERTY]);

if (propertyExists()) {
    gs.info('{0}: property {1} already exists, updating it to true', [LOG_PREFIX, PROPERTY])
    updateProperty();
} else {
    gs.info('{0}: property {1} doesnt exists, creating it and setting it to true', [LOG_PREFIX, PROPERTY])
    createProperty();
}

gs.info("{0}: Done Updating {1} property", [LOG_PREFIX, PROPERTY]);


function propertyExists() {
    return !gs.nil(gs.getProperty(PROPERTY));
}

function updateProperty() {
    var gr = new GlideRecord('sys_properties');
    gr.addQuery('name', PROP_NAME);
    gr.query();

    if (gr.next()) {
        gr.setValue('value', true);
        gr.update();
    } else {
        gs.error("{0}: Failed to update {1} property", [LOG_PREFIX, PROPERTY]);
    }
}

function createProperty() {
    var gr = new GlideRecord('sys_properties');
    gr.setValue('name', PROPERTY);
    gr.setValue('value', true);
	gr.setValue('type', 'boolean')
    gr.insert();
}
