function onClick() {
    var gModal = new GlideModal('ais_genius_result_configuration_clone');
    var id = g_form.getUniqueValue();
    gModal.setTitle('Set Genius Result Configuration Name');
    gModal.setPreference('old_id', id);
    gModal.render();
}
