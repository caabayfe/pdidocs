var currentUserId = gs.getUserID();
var checkedOutById = current.getValue('checked_out_by');

answer = (currentUserId == checkedOutById);
