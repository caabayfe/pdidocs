// In On Order, In Stock and In Transit, we should not have an Assigned To
current.assigned_to = '';
gs.addInfoMessage(gs.getMessage('Asset \'Assigned To\' was cleared due to asset state changing.'));
