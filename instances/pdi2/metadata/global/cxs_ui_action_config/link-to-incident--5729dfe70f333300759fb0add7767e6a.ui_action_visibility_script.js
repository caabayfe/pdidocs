/**
* Description: Client side script for customizing UI action conditions.
* Parameters:
* current (GlideRecord): The GlideRecord object for current action record.
* resource (GlideRecord): The GlideRecord object for resource action record.
* matched: Assign this variable to true when the conditions are matched.
* Example:
* matched = current.getValue('parent_incident') !== resource.getUniqueValue();
*/
