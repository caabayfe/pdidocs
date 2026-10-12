answer = false;
if (gs.getUserID() == current.getValue("user") || gs.hasRole("sn_employee.admin"))
   answer = true;
