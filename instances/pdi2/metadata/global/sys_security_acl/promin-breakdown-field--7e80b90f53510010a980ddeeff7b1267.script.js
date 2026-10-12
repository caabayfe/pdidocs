var prominAclUtils = new global.ProminACLUtil(current.entity.project.getRefRecord());
answer = prominAclUtils.canWriteInChildTableDef() && !prominAclUtils.isPlaybookProject();
