addRelationship();

function addRelationship() {
	var child_id = parent.sys_id;
	var parent_id = current.sys_id;
	var storageRelation = new GlideRecord('cmdb_rel_ci');
	storageRelation.initialize();
	storageRelation.parent = parent_id;
	storageRelation.child = child_id;
	storageRelation.type = "4afd799338a02000c18673032c71b817"; //Provided By::Provides
	storageRelation.insert();
}
