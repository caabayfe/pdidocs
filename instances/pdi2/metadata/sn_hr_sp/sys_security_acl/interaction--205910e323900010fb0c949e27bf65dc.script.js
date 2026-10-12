answer = false;
var user = gs.getUserID();
if (!current.assigned_to)
	answer = true;
else if (current.assigned_to == user)
	answer = true;
else if (current.opened_for == user)
	answer = true;
else 
	answer = gs.hasRole('sn_hr_sp.esc_admin');
