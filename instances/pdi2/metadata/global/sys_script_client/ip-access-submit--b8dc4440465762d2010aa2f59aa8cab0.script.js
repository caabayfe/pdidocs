function onSubmit() {
    var start = g_form.getValue('range_start');
    var end = g_form.getValue('range_end');
    var isV6Type = isIPV6Type(start);

    if (start == '' || end == '') {
        alert(getMessage('IP range start and end must have values'));
        return false;
    }

    if (isV6Type && (!isIPV6Format(start) || !isIPV6Format(end))) {
        alert(getMessage('IP range start and end must be in IPv6 format, e.g. fd07:a47c:3742:823e:3b02:76:982b:463'));
        return false;
    }

    if (!isV6Type && (!isIPV4Format(start) || !isIPV4Format(end))) {
        alert(getMessage('IP range start and end must be in IPv4 format, e.g. 132.76.234.112'));
        return false;
    }

    if (isV6Type)
        return checkV6Range(start, end);
    else
        return checkV4Range(start, end);


}
