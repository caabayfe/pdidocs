(function() {
    var security = new global.DocumentObjectSecurity();

    // Owner check required for folders located in the root folder
    if (security._isOwner(current))
        return true;

    if (!current.parent_folder.nil()) {
        var parentFolder = new GlideRecord('ds_folder');
        if (parentFolder.get(current.parent_folder))
            return security.canDeleteFolderRecursive(parentFolder);
    }

    return false;
})();
