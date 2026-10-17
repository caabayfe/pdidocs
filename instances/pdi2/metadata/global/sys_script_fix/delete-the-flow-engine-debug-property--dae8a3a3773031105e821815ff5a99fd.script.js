var oldPropName = 'com.glide.hub.flow_engine.debug';
var oldPropValue = gs.getProperty(oldPropName, null);

var newPropName = 'com.glide.hub.flow_engine.log_level';
var newPropValue = gs.getProperty(newPropName);

if (oldPropValue == null) {
    gs.log('Deprecated property ' + oldPropName + ' does not exist. No action performed.');
} else {
    if (oldPropValue === 'true' && newPropValue !== 'DEBUG') {
        gs.log('Deprecated property ' + oldPropName + ' exists with value ' + oldPropValue + ' . Changing property ' + newPropName + ' from ' + newPropValue + ' to DEBUG.');
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', newPropName);
        gr.query();
        if (gr.next()) {
            gr.setValue('value', 'DEBUG');
            gr.setWorkflow(false);
            gr.update();
        }
    }

    gs.log('Deleting deprecated property ' + oldPropName + ' having value ' + oldPropValue + '.');
    var oldPropGr = new GlideRecord('sys_properties');
    oldPropGr.addQuery('name', oldPropName);
    oldPropGr.query();
    if (oldPropGr.next()) {
        oldPropGr.deleteRecord();
    }
}
