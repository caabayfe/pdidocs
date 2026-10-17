(function executeRule(current, previous /*null when async*/ ) {

    if (current.value == "false") {
        GlidePropertiesDB.set('glide.security.3des.encryption.allow', 'true');
        GlidePropertiesDB.set('glide.security.glideencrypter.allow', 'true');
        GlidePropertiesDB.set('glide.security.glideencrypter.aes.encryption.allow', 'false');
    }

})(current, previous);
