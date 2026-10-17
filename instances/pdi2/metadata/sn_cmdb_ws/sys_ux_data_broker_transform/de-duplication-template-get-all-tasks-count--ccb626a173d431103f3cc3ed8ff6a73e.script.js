function transform(input) {
	var result = {
		matchedTasks: 0,
		userTasks: 0,
		totalTasks: 0
	};

	var matchedTasks = input.matchedTasks;
	var userTasks = input.userTasks;

	if (!matchedTasks.items && !userTasks.items) {
		return result;
	}

	if (!matchedTasks.items) {
		var total = userTasks.items.length;
		result.userTasks = total;
		result.totalTasks = total;
		return result;
	}

	if (!userTasks.items) {
		total = matchedTasks.items.length;
		result.matchedTasks = total;
		result.totalTasks = total;
		return result;
	}

	var matchedTasksCount = matchedTasks.items.length;;
	var userTasksCount = userTasks.items.length;

	var totalTasksCount = matchedTasksCount;
	// the total tasks count will not count the same tasks found in both sets again
	for (var i = 0; i < userTasks.items.length; i++) {
		var userItem = userTasks.items[i];

		// if matchedTasks via condition does not already contain an item in userTasks,
		// then we want to count it towards the total count
		var contains = false;
		for (var j = 0; j < matchedTasks.items.length; j++) {
			var matchedItem = matchedTasks.items[j];
			if (userItem.sysId == matchedItem.sysId) {
				contains = true;
				break;
			}
		}

		if (!contains) {
			totalTasksCount++;
		}
	}

	result = {
		matchedTasks: matchedTasksCount,
		userTasks: userTasksCount,
		totalTasks: totalTasksCount
	};

	return result;
}
