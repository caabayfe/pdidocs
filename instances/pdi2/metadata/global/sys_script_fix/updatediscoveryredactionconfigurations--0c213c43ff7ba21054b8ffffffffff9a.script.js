(function () {

    // 1. Synchronize parameters for each probe.
    var probeParameterUpdater = new RedactionProbeParameterUtil();
    var gr = new GlideRecord('discovery_sensitive_data_filter');
    gr.addActiveQuery();
    gr.addNotNullQuery('probe');
    // Do not create probe parameters for HD probe
    gr.addQuery('probe', '!=', '4f64c6389f230200fe2ab0aec32e7068');
    gr.query();
    while (gr.next()) {
        var probeId = gr.probe.toString();
        probeParameterUpdater.sync(probeId);
    }

    // 2. Synchronize the redaction cache for the Horizontal Discovery Probe.
    new RedactionPatternCacheUtil().sync();

    gs.log('UpdateRedactionFilters: Redaction filter update process finished.');
})();
