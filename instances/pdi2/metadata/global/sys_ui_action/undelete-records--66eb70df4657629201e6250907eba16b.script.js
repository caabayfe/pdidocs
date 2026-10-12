new GlideAuditDelete().undelete(current.sys_id);
gs.addInfoMessage(current.tablename + ' ' + GlideStringUtil.escapeHTML(current.display_value) + ' undeleted');
