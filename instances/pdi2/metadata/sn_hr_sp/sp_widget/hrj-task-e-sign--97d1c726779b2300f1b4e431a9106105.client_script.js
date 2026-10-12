function($scope, $sce, snAnalytics) {
	var c = this;
	if ($scope.data.task.description) {
		c.description = $sce.trustAsHtml($scope.data.task.description);
	}

	$scope.$on('sn_esign.esignComplete', function(event) {
		c.todoCompleted(event);
	});

	$scope.$on('sn_hr_sp.esignComplete', function(event) {
		c.todoCompleted(event);
	});
	
	c.todoCompleted = function(event){
		var completePayload= {};
		var completedTaskLocationPayload = {};

		completePayload.name = "To-do Complete";
		completePayload.data = {};
		completePayload.data["To-do Type"] = "HR Task To-do";
		completePayload.data["Task Type"] = c.data.task.hr_task_type_label;
		completePayload.data["Task Short Description"] = c.data.task.short_description;
		snAnalytics.addEvent(completePayload);
		
		if (c.data.task.fulfillment_type != '' && c.data.task.assigned_to_me && 
			c.data.task.assigned_to.userId == c.data.task.subject_person.id) {
			var subjectPersonPayload= {};
			if (c.data.task.fulfillment_type == 'journey')
				subjectPersonPayload.name = "Subject Person Journey Task To-do Complete";
			if (c.data.task.fulfillment_type == 'lifecycle_event')
				subjectPersonPayload.name = "Subject Person LE Task To-do Complete";
			subjectPersonPayload.data = {};
			subjectPersonPayload.data["To-do Type"] = "HR Task To-do";
			subjectPersonPayload.data["Task Type"] = c.data.task.hr_task_type_label;
			subjectPersonPayload.data["Task Short Description"] = c.data.task.short_description;
			snAnalytics.addEvent(subjectPersonPayload);

			completedTaskLocationPayload.name = "Task completed location";
			completedTaskLocationPayload.data = {};
			completedTaskLocationPayload.data['Location completed'] = (event.currentScope.page == "hrm_todos_page") ?  "To-do page" : "Journey's page";
			snAnalytics.addEvent(completedTaskLocationPayload);
		}

	};
}
