updateParent();


function updateParent() {
    var parent = new GlideRecord('expert');
    parent.get(current.expert);
    if (parent.first_panel.nil()) {
        parent.first_panel = current.sys_id;
        parent.update();
    }
}
