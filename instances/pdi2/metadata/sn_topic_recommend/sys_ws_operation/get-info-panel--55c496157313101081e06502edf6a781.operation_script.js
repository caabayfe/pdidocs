(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
      var pathParams = request.pathParams;
      var reportId = pathParams.reportId;
      var intentId = pathParams.intentId;

      var resolvedStates = gs.getProperty('sn_topic_recommend.intent_report_resolved_states');
      var validStates = resolvedStates.split(',');
	
      var grReport = new GlideRecord('sn_topic_recommend_intent_report');
      grReport.addQuery('rep_sys_id', reportId);
      grReport.addQuery('intent_sys_id', intentId);
      grReport.query();

      var result = {
        languages: [],
        contactTypes: [],
        assignmentGroups: [],
        time: 0
      };
	
      if (grReport.next()) {
        var breakdowns = grReport.getValue('intent_breakdowns');
        try {
          breakdowns = JSON.parse(breakdowns) || {};
        } catch(ex) {
          breakdowns = {};
        }

        var key;
        for (key in breakdowns.language) {
          result.languages.push({
            label: key,
            value: breakdowns.language[key].pct
          });
        }

        for (key in breakdowns.contact_type) {
          result.contactTypes.push({
            label: key,
            value: breakdowns.contact_type[key].pct
          });
        }

        for (key in breakdowns.assignment_group) {
          result.assignmentGroups.push({
            label: key,
            value: breakdowns.assignment_group[key].pct
          });
        }

        for(var i = 0; i < validStates.length; i++) {
          var stateIdx = validStates[i].trim();
          if (breakdowns.state && breakdowns.state[stateIdx] && breakdowns.state[stateIdx].mttr) {
            result.time = breakdowns.state[stateIdx].mttr;
			break;
          }  
        }

      }
	

      response.setStatus(200);
      response.setContentType('application/json');
      response.setBody(result);
    })(request, response);
