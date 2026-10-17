gs.addInfoMessage(gs.getMessage("Running archive destroy rule: {0}",current.name));
new GlideArchiver().archiveDestroyByRule(current.sys_id);
