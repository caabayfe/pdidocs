function onChange(control, oldValue, newValue, isLoading) {
    var isV6Type = isIPV6Type(newValue);
    var isV4Format = isIPV4Format(newValue);
    var isV6Format = isIPV6Format(newValue);

    if (!isV6Type && isV4Format && !isLoading && g_form.getValue('range_end') == '')
        g_form.setValue('range_end', newValue);

    if (isV6Type && isV6Format && !isLoading && g_form.getValue('range_end') == '')
        g_form.setValue('range_end', newValue);

    if (!isV6Type && !isV4Format && newValue != '')
        g_form.showFieldMsg("range_start", getMessage('IP address must be in IPv4 numerical format with no spaces, e.g. 132.76.234.112'), "error");

    if (isV6Type && !isV6Format && newValue != '')
        g_form.showFieldMsg("range_start", getMessage('IP address must be in IPv6 numerical format with no spaces, e.g. fd07:a47c:3742:823e:3b02:76:982b:463'), "error");

    var start = g_form.getControl('range_start');
    start.focus();
}
