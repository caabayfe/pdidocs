/**
* Description: scripting condition for Search UI Action's visibility.
* Variables available:
* 	current (GlideRecord): GlideRecord object of form record.
* 	resource (GlideRecord): GlideRecord object of search result record.
* Variable to set:
* 	visible (boolean): Script writer needs to set this variable to true/false to determine whether to show/hide this UI action.
* Example:
* 	visible = current.getValue('parent_incident') !== resource.getUniqueValue();
*/
visible = current.rfc.nil() && current.canWrite() && current.rfc.canWrite();
