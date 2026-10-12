var RestValidator = (function() {

    function isUniqueBasePath(sysId, basePath) {
        return isUniqueInWebServices(sysId, basePath) && isUniqueInCollections(sysId, basePath);
    }

    function isUniqueInWebServices(sysId, basePath) {
        var gr = new GlideRecord('sys_ws_definition');
        gr.addQuery('base_uri', basePath);
        gr.addQuery('sys_id', '!=', sysId);
        gr.addActiveQuery();
        gr.query();
        return !gr.hasNext();
    }

    function isUniqueInCollections(sysId, basePath) {
        var gr = new GlideRecord('sys_api_collection');
        if (!gr.isValid())
            return true;

        gr.addQuery('base_path', basePath);
        gr.addQuery('sys_id', '!=', sysId);
        gr.addActiveQuery();
        gr.query();
        return !gr.hasNext();
    }

    return {
        isUniqueBasePath: isUniqueBasePath
    };
})();
