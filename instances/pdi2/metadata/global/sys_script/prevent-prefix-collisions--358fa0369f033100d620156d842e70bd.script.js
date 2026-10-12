/**
* Prevents creating sys_number records with colliding prefix:
*	- Same prefix
*	- Prefix ending with a number and same alphanumerical prefix as an existing record
*	- We get the alphanumerical prefix by selecting all characters up to the last non-digit one
*	- On the same table family, TASK and TASK67 collide, TASK and TASK3b5 don't
*/

function onBefore(current, previous) {
	var tableBase = new TableUtils(current.category).getAbsoluteBase();
	var tableFamily = new TableUtils(tableBase).getAllExtensions();
	tableFamily = tableFamily.toArray().join(',');
	//We trim the last digits
	var stemMatcher = /^(.*\D+)\d*$/i.exec(current.prefix);
	var stem = stemMatcher ? stemMatcher[1] : '';
	var potentialCollisions = getPotentialCollisions(stem, current.sys_id, tableFamily);
	while (potentialCollisions.next()) {
		if (isCollision(stem, potentialCollisions.prefix)) {
			msg = gs.getMessage('The prefix {0} collides with the prefix of an existing record', current.prefix);
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
		}	
	}
	
	//Get potential collisions for the given stem
	//i.e records with prefix that starts with the same stem, other than the current one
	function getPotentialCollisions(stem, sys_id, tableFamily) {
		var numbers = new GlideRecord('sys_number');
		numbers.addQuery('prefix', 'STARTSWITH', stem);
		numbers.addQuery('sys_id', '!=', sys_id);
		numbers.addQuery('category', 'IN', tableFamily);
		numbers.query();
		return numbers;
	}
	
	//returns true if the prefix is a collision for the given stem
	//i.e if it is the stem followed by any number
	function isCollision(stem, prefix) {
		var re = new RegExp("^" + stem + "\\d*$", "i");
		return re.test(prefix);
	}
}
