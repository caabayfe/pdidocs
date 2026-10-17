gs.addInfoMessage(gs.getMessage("Running archive destroy rule: {0}",current.destroy_rule.name));
new GlideArchiver().archiveDestroyByRule(current.destroy_rule);
