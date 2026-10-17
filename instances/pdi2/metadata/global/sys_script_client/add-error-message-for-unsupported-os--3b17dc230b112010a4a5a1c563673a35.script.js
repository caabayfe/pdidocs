function onLoad() {
    //Type appropriate comment here, and begin script below
    g_form.setDisplay('host_os_distribution', 'false');
    g_form.setDisplay('host_os_version', 'false');
    g_form.setDisplay('host_os_address_width', 'false');
    var KB = 'KB0863694';
    var KBLink = '<a href= "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0863694">' + KB + '</a>';
    if (g_form.getValue('host_os_distribution').includes('Windows Server 2008')) {
        g_form.addErrorMessage('The ServiceNow MID Server will not support ' + g_form.getValue('host_os_distribution') + ' hosts from the early access Rome release or general Rome release in September 2021. See ' + KBLink + ' for more information.');
    } else if (g_form.getValue('host_os_distribution') == 'Linux CentOS' && g_form.getValue('host_os_version').charAt(0) == '6' && g_form.getValue('host_os_version').charAt(1) == '.') {
        g_form.addErrorMessage('The ServiceNow MID Server will not support Centos 6 hosts from the early access Rome release or general Rome release in September 2021. See ' + KBLink + ' for more information.');
    } else if (g_form.getValue('host_os_address_width') == '32-bit') {
        g_form.addErrorMessage('The ServiceNow MID Server will not support 32-bit systems (Windows or Linux) hosts from the early access Rome release or general Rome release in September 2021. See ' + KBLink + ' for more information.');
    }
}
