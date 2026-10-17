function onChange(control, oldValue, newValue, isLoading) {
    var isV6Type = isIPV6Type(newValue);
    var isV6Format = isIPV6Format(newValue);
    var isV4Format = isIPV4Format(newValue);

    if (isV6Type && isV6Format || !isV6Type && isV4Format || newValue == '')
        return;

    if (isV6Type)
        g_form.showFieldMsg("range_end", getMessage('IP address must be in IPV6 numerical format with no spaces, e.g. fd07:a47c:3742:823e:3b02:76:982b:463'), "error");
    else
        g_form.showFieldMsg("range_end", getMessage('IP address must be in IPv4 numerical format with no spaces, e.g. 132.76.234.112'), "error");

    var end = g_form.getControl('range_end');
    end.focus();
}
