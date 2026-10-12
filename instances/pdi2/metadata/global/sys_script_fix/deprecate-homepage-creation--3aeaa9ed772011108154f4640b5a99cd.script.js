gs.log('START - Deprecate homepage creation');
var gr = new GlideRecord('sys_properties');
gr.addQuery('name', 'com.glideapp.home.deprecate_homepages');
gr.addQuery('value', 'false');
gr.query();

if (gr.next()) {
    gs.log('com.glideapp.home.deprecate_homepages with value false is found.');
    var fileName = gr.getValue('sys_update_name');
    var grCustomerUpdate = new GlideRecord('sys_update_xml');
    if (!grCustomerUpdate.get('name', fileName)) {
        gr.setValue('value', 'true');
        gr.update();
        gs.log('Updated com.glideapp.home.deprecate_homepages property to true.');
    }
}
gs.log('END - Deprecate homepage creation');
