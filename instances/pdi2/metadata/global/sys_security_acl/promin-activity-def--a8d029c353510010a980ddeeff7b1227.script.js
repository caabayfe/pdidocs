var prominACLUtils = new global.ProminACLUtil(current.entity.project.getRefRecord());
answer = prominACLUtils.canDeleteChildTableDef() && !prominACLUtils.isPlaybookProject();
