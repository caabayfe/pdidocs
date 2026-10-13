function onAfter(current, previous) {
      	var im = new SNC.ImpactManager();
im.handleDeletedGroup(current.sys_id);
}
