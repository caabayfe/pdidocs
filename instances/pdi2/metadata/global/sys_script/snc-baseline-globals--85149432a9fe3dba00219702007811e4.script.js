/**
 * ServiceNow
 * Check to see if at least one proposed change exists for task
 * @param GlideRecord task
 * @returns {Boolean}
 */
function ProposedChangesExist(task) {
	var c = new GlideAggregate('task_ci');
	c.addQuery('task', task.getUniqueValue());
	c.addQuery('xml', '!=', '');
	c.addQuery('applied','false');
	c.addAggregate('COUNT');
	c.query();
	var r = 0;
	if (c.next())
		r = c.getAggregate('COUNT');
	
	if (r == 0)
		return false;
	
	return true;
}
