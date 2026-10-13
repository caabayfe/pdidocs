(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("sn_dt_translation_cache");
    gr.query();
    gr.deleteMultiple();

    var grDetect = new GlideRecord("sn_dt_detection_cache");
    grDetect.query();
    grDetect.deleteMultiple();
})(current, previous);
