answer = gs.getUser().hasRole('data_manager_admin') || gs.getUserID() === current.assigned_to.toString();
