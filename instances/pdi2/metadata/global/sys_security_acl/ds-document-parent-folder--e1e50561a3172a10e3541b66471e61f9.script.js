(function() {
    var security = new global.DocumentObjectSecurity();
    var newParentFolderSysId = current.parent_folder;
    var oldParentFolderSysId = current.getOriginalValue('parent_folder');

    var oldParentFolderGR = new GlideRecord('ds_folder');
    if (oldParentFolderSysId) {
        if (!oldParentFolderGR.get(oldParentFolderSysId))
            return false;
        if (!oldParentFolderGR.canWrite())
            return false;
    }

    if (!newParentFolderSysId)
        return true;

    var newParentFolderGR = new GlideRecord('ds_folder');
    if (!newParentFolderGR.get(newParentFolderSysId))
        return false;
    return newParentFolderGR.canWrite();
})();
