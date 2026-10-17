(function executeRule(current, previous /*null when async*/ ) {

    if (previous && previous.getValue('parent_folder') === current.getValue('parent_folder')) {
        return;
    }

    var currentId = current.getValue('sys_id');
    var parentId = current.getValue('parent_folder');

    // Direct self-parenting
    if (parentId === currentId) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Invalid parent: Folder cannot be its own parent.'));
        return;
    }

    var visited = {}; // safeguard against existing cycles

    while (parentId) {

        // Cycle detected 
        if (visited[parentId]) {
            // We encountered an existing loop in the data; stop to avoid infinite loop.
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Invalid parent: this would create a cycle in the folder hierarchy.'));
            return;
        }

        visited[parentId] = true;

        // If we reach the current record while walking up, it's a cycle
        if (parentId === currentId) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Invalid parent: this would create a cycle in the folder hierarchy.'));
            return;
        }

        var parentGr = new GlideRecord('ds_folder');
        if (!parentGr.get(parentId)) {
            break;
        }

        // Move one level up
        parentId = parentGr.getValue('parent_folder');
    }

})(current, previous);
