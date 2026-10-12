var prominAclUtils = new global.ProminACLUtil(current.project.getRefRecord());
answer = prominAclUtils.canDeleteChildTableDef() && !prominAclUtils.isPlaybookProject();
