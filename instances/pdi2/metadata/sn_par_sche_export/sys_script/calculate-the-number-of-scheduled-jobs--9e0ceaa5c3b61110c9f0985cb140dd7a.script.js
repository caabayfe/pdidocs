(function executeRule(current, previous /*null when async*/ ) {
    var vizIds = current.visualizations.split(',');
    var parViz = new GlideRecord('par_visualization');
    for (var i = 0; i < vizIds.length; i++) {
        var agg = new GlideAggregate('par_export_visualization');
        agg.addQuery('visualizations', 'CONTAINS', vizIds[i]);
        agg.query();
        if (parViz.get(vizIds[i])) {
            parViz.scheduled_count = agg.getRowCount();
            parViz.update();
        }
    }
})(current, previous);
