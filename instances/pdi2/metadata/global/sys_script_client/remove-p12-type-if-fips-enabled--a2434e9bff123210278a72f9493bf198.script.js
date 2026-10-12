function onLoad() {
    if (!g_form.isNewRecord())
        return;

    var field = 'type';
    var pkcs12ChoiceValue = 'pkcs12_key_store';
    var bcfksChoiceValue = 'bcfks_key_store';

    var ga = new GlideAjax('sn_kmf.KMFUtil');
    ga.addParam('sysparm_name', 'isInFipsApprovedOnlyMode');
    ga.getXMLAnswer(function(answer) {
        var fipsEnabled = (answer === 'true');

        if (fipsEnabled) {
            // Remove PKCS12 choice
            g_form.removeOption(field, pkcs12ChoiceValue);

            // If pre-set (e.g., via URL), force BCFKS
            if (g_form.getValue(field) === pkcs12ChoiceValue)
                g_form.setValue(field, bcfksChoiceValue);
        }
    });
}
