var history = new GlideRecord('sys_upgrade_history');
history.query("update_set", current.sys_id + "");
if (history.next())
  action.setRedirectURL(history);
