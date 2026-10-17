(function() {
    var a = new global.DocumentObjectSecurity();
    if (!current.parent_folder.nil()) {
        var folderGR = new GlideRecord('ds_folder');
        if (!folderGR.get(current.parent_folder))
            return false;
        return folderGR.canDelete() && a.canDeleteDocument(current);
    } else
        return a.canDeleteDocument(current);
})();
