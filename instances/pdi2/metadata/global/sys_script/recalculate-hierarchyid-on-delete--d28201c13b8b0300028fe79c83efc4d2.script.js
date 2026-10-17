(function executeRule(current, previous /*null when async*/) {

var manageHierarchy = new CapabilityManageHierachy();
manageHierarchy.processCapabilityDeletion(current.hierarchy_id,current.parent);


})(current, previous);
