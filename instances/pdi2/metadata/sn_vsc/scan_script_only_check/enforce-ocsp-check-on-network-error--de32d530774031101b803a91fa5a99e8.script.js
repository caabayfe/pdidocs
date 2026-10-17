(function(finding) {
    var targetProperty = 'com.glide.communications.httpclient.ocsp_allow_network_error';
    var expectedValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, 'true');

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
