if (gs.getUserID() == current.user.sys_id || gs.getUser().hasRole('user_login_history_viewer'))
    answer = true;
else
    answer = false;
