(function executeRule(current, previous /*null when async*/ ) {
    var credStoreGr = new GlideRecord('pwd_cred_store');
    credStoreGr.addQuery('type', current.getUniqueValue());

    credStoreGr.setValue('child_alias', 'NULL');
    credStoreGr.updateMultiple();
})(current, previous);
