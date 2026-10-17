answer = gs.hasRole('admin,pa_admin,pa_kpi_signal_admin') || current.signal.process.responsible_users.contains(gs.getUserID());
