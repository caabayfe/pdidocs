answer = false;
if (!gs.nil(current.project)) {
    answer = new global.ProminACLUtil(current.project.getRefRecord()).canDeleteChildTableDef();
} else if (!gs.nil(current.process_def)) {
    answer = current.process_def.getRefRecord().canDelete();
}
