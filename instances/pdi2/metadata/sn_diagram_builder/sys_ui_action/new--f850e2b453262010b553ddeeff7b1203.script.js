var uri = action.getGlideURI();
var sourceURL = action.getGlideURI().get('sysparm_collection');
if (sourceURL == 'sn_diagram_builder_shape_template') {
    id = action.getGlideURI().get('sysparm_collectionID');
    uri.set('sys_id', '-1');
    uri.set('sysparm_query', 'parent=' + id);
    action.setRedirectURL(uri.toString('sn_diagram_builder_shape_template_m2m.do'));
}
