function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '') {
        return;
    }

    var aclFN = gel('ni_fn_sys_security_acl.name');
    if (!aclFN)
        return;

    if (!g_scratchpad.aclExcludeOpIDs)
        return;

    if (g_scratchpad.aclExcludeOpIDs.includes(newValue))
        aclFN.disabled = true;
    else
        aclFN.disabled = false;

}
