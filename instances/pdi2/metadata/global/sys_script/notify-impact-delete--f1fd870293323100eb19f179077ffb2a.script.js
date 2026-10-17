function onAfter(current, previous) {
   	var im = new SNC.ImpactManager();
	im.handleDeletedRelation(current.service_group, current.service);
   
}
