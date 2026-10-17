function onLoad() {
    // stop early for new ACLs
    if (g_form.isNewRecord())
        return;

    var aclGR = new GlideRecord('sys_security_acl');
    aclGR.get(g_form.getUniqueValue());
    var name = aclGR.getValue('name');

    // stop if the ACL is table level, or we aren't dealing with a datatype ACL
    if (!name || !name.includes('.') || !(/^\[[^\[\]]*\]$/.test(name.split('.')[1])))
        return;

    var nameElement = g_form.getElement('sys_security_acl.name');
    nameElement.value = name;
}
