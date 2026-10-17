getPIIEncryptedFields();

function getPIIEncryptedFields() {
    var encryptedFields = 0;
    if (gs.tableExists('sn_vsc_pii_encrypted_fields_view')) {
        var gr = new GlideRecord('sn_vsc_pii_encrypted_fields_view');
        gr.query();
        if (gr.hasNext()) {
            encryptedFields = gr.getRowCount();
        }
    }
    return encryptedFields;
}
