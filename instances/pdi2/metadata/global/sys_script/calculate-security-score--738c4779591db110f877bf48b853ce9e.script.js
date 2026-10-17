(function executeRule(current, previous /*null when async*/ ) {
		var processStrength = new global.PwdProcessStrengthCalculatorUtil().getProcessStrength(current.sys_id);
		var doesScoreChange = false;
		if (!gs.nil(processStrength)) {
			var score = JSON.parse(processStrength).securityScore;
			if (current.security_score != score) {
				current.security_score = score;
				doesScoreChange = true;
			}
		} else if (!gs.nil(current.security_score)) {
			current.security_score = '';
			doesScoreChange = true;
		}

		if (doesScoreChange) {
			var wf = current.getWorkflow();
			current.setWorkflow(false);
			current.update();
			current.setWorkflow(wf);
		}
	})(current, previous);
