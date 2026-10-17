var ep_Reminder = Class.create();
ep_Reminder.prototype = Object.extendsObject(sn_employee.ep_ReminderSNC, {

	type: 'ep_Reminder'
});

// Object.extendsObject only clones prototype from parent class
// Clone missing non-prototype properties from parent class
(function() {
	for (var property in sn_employee.ep_ReminderSNC)
		if (!ep_Reminder.hasOwnProperty(property))
			ep_Reminder[property] = sn_employee.ep_ReminderSNC[property];
})();
