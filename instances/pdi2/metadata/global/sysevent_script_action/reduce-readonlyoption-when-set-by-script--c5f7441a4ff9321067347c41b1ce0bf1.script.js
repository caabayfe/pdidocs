// If a decision was made to strictly enforce read-only but there is an existing client script that updates the field
// on the client, this script will reduce the read only option setting to 'client_script_modifiable' to allow the
// client script to continue updating the field. Run this script only for ServiceNow scoped apps that are upgraded
// independently of an instance upgrade.
var strictReadOnlyOption = new StrictReadOnlyOption();
strictReadOnlyOption.setClientScriptModifiableWhereAffected();
