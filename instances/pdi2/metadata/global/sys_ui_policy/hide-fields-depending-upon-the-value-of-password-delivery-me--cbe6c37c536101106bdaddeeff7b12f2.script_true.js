function onCondition() {
    var credStoreTypeName = g_form.getReference("type").name.escapeHTML();
    var msg = formatMessage(getMessage("All the fields related to password generation and password policy are hidden because the '{0}' doesn't accept a password as input."), credStoreTypeName);
    g_form.addInfoMessage(msg);
}
