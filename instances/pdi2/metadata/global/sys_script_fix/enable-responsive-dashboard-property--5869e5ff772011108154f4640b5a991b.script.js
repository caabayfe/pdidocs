gs.log('START - Enable responsive dashboard property');
var gr = new GlideRecord('sys_properties');
gr.addQuery('name', 'glide.cms.enable.responsive_grid_layout');
gr.addQuery('value', 'false');
gr.query();

if (gr.next()) {
    gs.log('glide.cms.enable.responsive_grid_layout with value false is found.');
    gr.setValue('value', 'true');
    gr.update();
    gs.log('Updated glide.cms.enable.responsive_grid_layout property to true.');
}
gs.log('END - Enable responsive dashboard property');
