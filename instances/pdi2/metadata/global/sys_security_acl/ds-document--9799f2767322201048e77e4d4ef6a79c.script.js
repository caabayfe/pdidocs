(function() {
    var security = new global.DocumentObjectSecurity();

    if (security.canWriteDocument(current))
        return true;

    // Second: if there's a parent folder, check recursive write access to it
    if (!current.parent_folder.nil()) {
        var folderGR = new GlideRecord('ds_folder');
        if (folderGR.get(current.parent_folder))
            folderGR.canWrite();
    }

    // If no access via document or folder, deny write access
    return false;
})();
