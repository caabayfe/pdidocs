function onClick() {
    var gm = new GlideModal('ais_search_profile_clone');
    var id = g_form.getUniqueValue();
    gm.setTitle('Set Profile Label');
    gm.setPreference('old_id', id);
    gm.render();
}
