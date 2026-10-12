(function() {
    if (!current.parent_folder.nil()) {
        var folderGR = new GlideRecord('ds_folder');
        if (folderGR.get(current.parent_folder)) {
			return folderGR.canWrite();
        } else
            return false;
    }
    return true;
})();
