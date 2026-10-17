(function executeRule(current, previous /*null when async*/ ) {
    // 2 represent Disabled status
    if (current.data_snapshot_status == 2) {
        var indicatorId = current.indicator;
        var indicatorGR = new GlideRecord('pa_indicators');
        if (indicatorGR.isValid() && indicatorGR.get(indicatorId)) {
            indicatorGR.is_mlb_enabled = false;
            indicatorGR.update();
        }
    }

})(current, previous);
