function onClick() {
    var gModal = new GlideModal('ais_dictionary_clone');
    var id = g_form.getUniqueValue();
    gModal.setTitle('Set Dictionary Label');
    gModal.setPreference('old_id', id);
    gModal.render();
}
