var ga = new GlideAjax('TaxonomyUtilAjax');
ga.addParam('sysparm_name', 'getOutdatedContentUrl');
ga.getXML(function(response) {
    if (response) {
        var result = response.responseXML.getElementsByTagName("result");
        if (result.length > 0 && result[0].getAttribute("url")) {
            var url = result[0].getAttribute("url");
            redirect(url);
        }
    }
});

function redirect(url) {
    window.location = url;
}
