var hierarchyGr = new GlideRecord('sys_record_hierarchy');
hierarchyGr.query();
while (hierarchyGr.next()) {
	SNC.RecordHierarchyAPI.get().reconcilePaths(hierarchyGr.getUniqueValue());
}
