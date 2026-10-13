function openDiscoErrorsHome() {
    var url = new GlideURL('$discovery_result_homepage.do');
    url.addParam('sysparm_page', 'view_errors');

    var w = getTopWindow();
    var newWindow = w.open(url.getURL(), "_blank");
    newWindow.focus();
}
