(function() {
    var security = new global.DocumentObjectSecurity();

    if (security.canReadDocument(current))
        return true;

    if (!current.parent_folder.nil()) {
        var folderGR = new GlideRecord('ds_folder');
        if (folderGR.get(current.parent_folder))
            return folderGR.canRead();
    }

    return false;
})();
