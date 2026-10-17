//The autonumber field is not on the form and we have a UI Policy that needs to know if there is a value in the field or not
g_scratchpad.auto_number = current.number_ref.getDisplayValue();
//If the session doesn't have write access to the record we need to know this client side to be able to hide the auto number checkbox
g_scratchpad.auto_number_access = current.canWrite();
