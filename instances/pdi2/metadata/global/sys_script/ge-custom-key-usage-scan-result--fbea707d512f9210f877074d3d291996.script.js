(function executeRule(current, previous /*null when async*/ ) {
    var GE_CUSTOM_KEY_USAGE_COMBO_SYSID = 'd8ae154effe71210fa1bffffffffff3b';
    var finding_count = current.getValue('finding_count');
    var scanResult = new GlideRecord('scan_result');
    scanResult.addQuery('sys_id', current.getUniqueValue());
    scanResult.query();

    if (scanResult.next()) {
        var combo = scanResult.getValue('combo');
        if (GE_CUSTOM_KEY_USAGE_COMBO_SYSID == combo) {
            if (parseInt(finding_count) > 0)
                GlidePropertiesDB.set("glide.glide_encrypter.custom_key.usage", "true");
            else
                GlidePropertiesDB.set("glide.glide_encrypter.custom_key.usage", "false");            
        }
    }
})(current, previous);
