(function() {
	
	if(input && input.sysId){
		data.sysId = input.sysId; 
		data.tableName = input.table;
		data.todoNumber = input.todoNumber;
		data.url = input.url;
		data.todoTitle = input.todoTitle;
					
	}else if(options && options.sysId){
		data.sysId = options.sysId; 
		data.tableName = options.table;
		data.todoNumber = options.todoNumber;
		data.url = options.url;
		data.todoTitle = options.todoTitle;
		
	}else
		return;
	data.caption = data.todoTitle;
	data.link = data.url;
	data.link_caption = data.todoNumber;
	if(data.sysId && data.tableName){
		var defaultTodoGr = new GlideRecordSecure(data.tableName);
		if(defaultTodoGr.get(data.sysId))
			data.task_created = defaultTodoGr.getValue("sys_created_on");
	}
	
})();
