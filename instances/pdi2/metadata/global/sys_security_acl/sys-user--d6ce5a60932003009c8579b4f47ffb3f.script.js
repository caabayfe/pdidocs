if (gs.getUserID() == current.sys_id || gs.getUser().hasRole('itil, user_admin, import_transformer, resource_manager, timecard_admin'))
    answer = true;
else 
    answer = false;
