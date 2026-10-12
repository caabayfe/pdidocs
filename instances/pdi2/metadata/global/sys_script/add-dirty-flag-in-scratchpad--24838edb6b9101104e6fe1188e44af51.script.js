(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.isModelDefDirty = current.dirty == true;

    var grVersion = new GlideRecord('promin_model_def_version');
    grVersion.addQuery('project', current.getUniqueValue());
    grVersion.addQuery('state', 'AVAILABLE');
    grVersion.query();
    g_scratchpad.isVersionPresent = grVersion.hasNext();

})(current, previous);
