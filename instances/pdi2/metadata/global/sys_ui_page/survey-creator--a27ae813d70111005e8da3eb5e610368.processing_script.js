(function(_this) {
	
	// Upon clicking one of the Submit buttons, do the appropriate action below
	if (typeof survey_creator_cancel !== 'undefined') {
			response.sendRedirect('/asmt_metric_type_list.do?sysparm_query=evaluation_method=survey^active=true^EQ&sysparm_view=survey');
		return;
	}

	saveSurvey();
	
	function saveSurvey() {
		var surveyInfoObj = (new JSONParser()).parse(surveyInfo);
		var name = surveyInfoObj.name;
		var description = surveyInfoObj.description;
		var metrics = surveyInfoObj.metrics;
		var publish_state = "draft";
		
		if (buttonClicked == "publish" )
			publish_state = "published";

		// Save the Metric Type for this Survey and set the ID to surveyId
		// The ID has to be set because the URL for the survey has already been generated and if a 
		// new ID is generated, then the previous URL will not work.
		var metricTypeId = new AssessmentUtils().createAssessment(surveyInfo, 'survey', publish_state, surveyId);

		// Prepare next URL
		var url = 'asmt_metric_type_list.do?sysparm_query=sys_id=' + metricTypeId + '&sysparm_view=survey';

		switch (survey_delivery) {
			case 'all':
				break;
			case 'invite':
				// Get all the users in the slush bucket
				var users = userId.split(',');
				var usersGr = new GlideRecord('sys_user');
				usersGr.addQuery('sys_id', 'IN', users);
				usersGr.query();
				getAssessmentInstances(usersGr, publish_state, metricTypeId, 'sys_id');
				break;
			case 'group':
				var selectedGroups = groupUserId.split(',');
				
				// for all groups, get all groups, duplicates are ok due to glide aggregate call after
				var allGroups = [];
				for (var i = 0; i < selectedGroups.length; ++i) {
					var childGroups = findAllGroups(selectedGroups[i]);
					allGroups = allGroups.concat(childGroups);
				}
				
				// glide aggregate to get all unique users, despite duplicate groups
				var usersGa = new GlideAggregate('sys_user_grmember');
				usersGa.groupBy('user');
				usersGa.addQuery('group', 'IN', allGroups);
				usersGa.query();
				
				getAssessmentInstances(usersGa, publish_state, metricTypeId, 'user');
				break;
			case 'triggered':
				// create a new trigger condition record with this survey pre-set
				var triggerConditionGr = new GlideRecord('asmt_condition');
				triggerConditionGr.assessment = metricTypeId;
				var triggerConditionId = triggerConditionGr.insert();

				// Set the schedule type to no limit for triggered surveys
				setSurveySchedule(metricTypeId, '0'); // 0 = No Limit
				
				// redirect to the newly created trigger condition and go to the survey page after this is done.
				url = 'asmt_condition.do?sysparm_query=sys_id=' + triggerConditionId + '&sysparm_stack='+url;
				break;
		}
		
		response.sendRedirect(url);
	}
	
	function getAssessmentInstances(users, publish_state, metricTypeId, attr ) {
		var defaultCategory = new GlideRecord('asmt_metric_category');
		defaultCategory.addQuery('metric_type', metricTypeId);
		defaultCategory.query();
		defaultCategory.next();
		var cat_sys_id = defaultCategory.sys_id;
		
		var catUserGr = new GlideRecord('asmt_m2m_category_user');
		while (users.next()) {
			catUserGr.user = users[attr];
			catUserGr.metric_category = cat_sys_id;
			catUserId = catUserGr.insert();
		}
		
		if (publish_state == 'published') {
			new SNC.AssessmentCreation().createAssessments(metricTypeId);
		}

	}
	
	function findAllGroups(parentGroup, groups) {
	   if (groups == null) {
		  groups = new Array();
		  groups.push(parentGroup);
	   }
	
	   var grGroup = new GlideAggregate("sys_user_group");
	   grGroup.addQuery("parent", parentGroup);
	   grGroup.query();
	
	   while (grGroup.next()) {
		  var childGroup = grGroup.sys_id;
	
		  if (groups.toString().indexOf(childGroup) != -1)
			  continue;
	
		  groups.push(childGroup.toString());
		  groups.concat(findAllGroups(childGroup, groups));
	   }
	
	  return groups;
	}
	function setSurveySchedule(metricTypeId, schedule) {
		var metricType = new GlideRecord('asmt_metric_type');
		metricType.get(metricTypeId);
		metricType.schedule_period = schedule;
		var metricTypeId = metricType.update();
	}
})(this);
