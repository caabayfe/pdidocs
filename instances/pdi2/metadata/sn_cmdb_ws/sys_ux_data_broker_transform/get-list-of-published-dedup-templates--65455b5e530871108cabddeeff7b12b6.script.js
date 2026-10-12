function transform(input) {
	
	var MAX_TEMPLATES = 100;
    var templateDetailsList = [];
    var response = {};
	//cache matching task counts per template
	var templateToMatchingTasksCountMap = {};
	getMatchingTasksCount();
    var rdt = new GlideRecord('reconcile_duplicate_template');
    rdt.addQuery('state', 'published');
    if (input.librarySysId) {
        rdt.addQuery('library', input.librarySysId);
    }
    rdt.query();
    var totalTemplates = 0;
	var totalTemplateTasks = 0;
    while (rdt.next()) {
		var totalTasks = 0;
        //check if the template is already running
        if (templateIsRunning(rdt.getValue('sys_id'))) {
            continue;
        }
		totalTemplates++;
        var templateDetails = {};
        templateDetails['template_sys_id'] = rdt.getValue('sys_id');
        templateDetails['template_name'] = rdt.getValue('name');
        templateDetails['template_description'] = rdt.getValue('description');
        templateDetails['template_class_name'] = getTableLabel(rdt.table.getDisplayValue());
		templateDetails['template_library'] = rdt.getValue('library');
		var libraryName = rdt.getDisplayValue('library');
        if(!libraryName){
			libraryName = "N/A";
		} 
		templateDetails['template_library_name'] = libraryName;
        var matchingTaskCount = 0;
		if(templateToMatchingTasksCountMap[rdt.getValue('sys_id')]){
			matchingTaskCount = parseInt(templateToMatchingTasksCountMap[rdt.getValue('sys_id')]);
		}
        totalTasks += parseInt(matchingTaskCount);
		totalTemplateTasks += totalTasks;
        templateDetails['template_tasks_count'] = totalTasks;
		templateDetails['template_matching_tasks_count'] = matchingTaskCount;

		// add table filter based on whether or not we want to show open tasks
		var filter = 'state=2^template=' + rdt.getValue('sys_id');
		if ((new GetDedupeTaskInfo()).showOnlyOpenTasks()) {
			filter += '^task.state=1';
		}
		templateDetails['template_filter'] = filter;

		// add schedule to template if it exists. 
		var scheduleId = rdt.getValue('schedule');
		if(scheduleId) {
			try {
				
				var gr = new DeduplicationTemplateScheduleService().getTemplateScheduleById(scheduleId);

				var time_zone = gr.getValue('time_zone');
				if(!time_zone)
					time_zone = '';

				// create template schedule with common fields
				var templateSchedule = {
					'sys_id': gr.getValue('sys_id'),
					'active': gr.getValue('active') == 0 ? false : true,
					'run_type': gr.getValue('run_type'),
					'time_zone' : time_zone,
					'name' : gr.getValue('name')
				};

				// format entered_time to work with time picker
				// var enteredTime = new GlideTime(); 
				// enteredTime.setValue(gr.getValue('entered_time'));
				// var enteredTimeFormatted = enteredTime.getByFormat("HH:mm:ss");

				// add correct fields depending on run_type
				switch(templateSchedule.run_type) {
					case 'daily':
						setTime(templateSchedule, gr);
						templateDetails['template_scheduleLabel'] = "Daily";
						break;
					case 'weekly':
						setTime(templateSchedule, gr);
						templateSchedule['run_dayofweek'] = gr.getValue('run_dayofweek');
						templateDetails['template_scheduleLabel'] = "Weekly";
						break;
					case 'monthly':
						setTime(templateSchedule, gr);
						templateSchedule['run_dayofmonth'] = gr.getValue('run_dayofmonth');
						templateDetails['template_scheduleLabel'] = "Monthly";
						break;
					case 'periodically':
						// break run_period down to days & time
						var run_period = gr.getValue('run_period');
						var dur = new GlideDuration();
						dur.setValue(run_period);
						templateSchedule['run_period_days'] = dur.getDayPart();
						templateSchedule['run_period_time'] = dur.getByFormat("HH:mm:ss");
						// format runStart to work with date/time picker
						// var runtStart = new GlideTime(); 
						// runtStart.setValue(gr.getDisplayValue('run_start'));
						// var runStartFormatted = runtStart.getByFormat("yyyy-MM-dd HH:mm:ss");
						templateSchedule['run_start'] = gr.getDisplayValue('run_start');
						templateDetails['template_scheduleLabel'] = "Periodically";
						break;
					} 

					// if schedule not active override schedule label with inactive
					if(!templateSchedule.active) 
						templateDetails['template_scheduleLabel'] = "Inactive";

				// set the 
				templateDetails['template_schedule'] = templateSchedule;

			} catch(e) {
				templateDetails['template_schedule'] = null;
				templateDetails['template_scheduleLabel'] = "No";
			}
		} else {
			// No schedule found
			templateDetails['template_scheduleLabel'] = "No";
		}

		templateDetails['template_library'] = rdt.getValue('library');
        templateDetailsList.push(templateDetails);
    }

	function setTime(templateSchedule,gr) {
		templateSchedule['run_time'] = gr.getDisplayValue('run_time');
		templateSchedule['entered_time'] = gr.getDisplayValue('entered_time');
	}

    function getMatchingTasksCount() {
        var suggestedTaskGr = new GlideAggregate('sn_cmdb_ws_reconcile_duplicate_template_suggested_task');
		suggestedTaskGr.addQuery('state', 2); //ready state
		if ((new GetDedupeTaskInfo()).showOnlyOpenTasks()) {
			suggestedTaskGr.addQuery('task.state', 1); // tasks are in open state
		}
		suggestedTaskGr.addAggregate('COUNT', 'template');
        suggestedTaskGr.query();
        while(suggestedTaskGr.next()) {
            templateToMatchingTasksCountMap[suggestedTaskGr.getValue('template')] = suggestedTaskGr.getAggregate('COUNT', 'template');
        }
    }

    function getTableLabel(table) {
        var dbo = new GlideRecord('sys_db_object');
        dbo.addQuery('name', table);
        dbo.query();
        if (dbo.next()) {
            return dbo.getValue('label');
        }
        return null;
    }
    templateDetailsList.sort(function(temp1, temp2) {
        if (parseInt(temp1.template_tasks_count) >= parseInt(temp2.template_tasks_count)) {
            return -1;
        } else {
            return 1;
        }
    });

    function templateIsRunning(templateSysId) {
        var gr = new GlideRecord('reconcile_duplicate_template_run');
        gr.addQuery('template', templateSysId);
        gr.addEncodedQuery('stateINdraft,ready,running,cancel_requested');
        gr.query();
        return gr.next();
    }
    response['total_templates'] = totalTemplates;
    response['total_tasks'] = totalTemplateTasks;
    response['template_details'] = templateDetailsList.slice(0, MAX_TEMPLATES);
    response.lastUpdatedInfoText = gs.getMessage("Last updated: {0}", new GlideDateTime().getDisplayValue());
    return response;
}
