(function() {
	data.task = {};
	if (input)
		data.sys_id = input.sys_id;
	else if (options)
		data.sys_id = options.sys_id;
	else
		data.sys_id = $sp.getValue("sys_id");
	
	var hrtt = new hr_TaskTicket();
	data.task = hrtt.getPulledTodo(data.sys_id);	
})();
