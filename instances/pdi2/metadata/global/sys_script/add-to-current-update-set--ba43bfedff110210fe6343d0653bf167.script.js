(function executeRule(current, previous /*null when async*/ ) {

    if (GlideStringUtil.notNil(current.schema_registry) && current.schema_registry.is_tracked.toString() == 'true') {
        var glideUpdateManager = new GlideUpdateManager2();
        glideUpdateManager.saveRecord(current);
    }

})(current, previous);
