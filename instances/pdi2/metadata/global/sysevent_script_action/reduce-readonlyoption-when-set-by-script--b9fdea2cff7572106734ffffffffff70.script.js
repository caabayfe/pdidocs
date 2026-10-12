// If a decision was made to strictly enforce read-only but there is an existing client script that updates the field
// on the client, this script will reduce the read only option setting to 'client_script_modifiable' to allow the
// client script to continue updating the field. This script action should not need to run indefinitely. It is 
// intended to run starting from the Australia release and execute for several releases while the read only 
var strictReadOnlyOption = new StrictReadOnlyOption();
strictReadOnlyOption.setClientScriptModifiableWhereAffected();
