if (gs.hasRole('report_admin') || gs.hasRole('viz_admin')) {
    answer = true;
} else {
    var visSysId = current.visualization;
    var gr = new GlideRecord('analytics_visualization');
    if (visSysId) {
        gr.get(visSysId);
    }
    answer = gr.canRead();
}
