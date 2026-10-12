var prominAclUtils = new global.ProminACLUtil(current.entity.project.getRefRecord());
answer = prominAclUtils.canDeleteChildTableDef() && !prominAclUtils.isPlaybookProject();
