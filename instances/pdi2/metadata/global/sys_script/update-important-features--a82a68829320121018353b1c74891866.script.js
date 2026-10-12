(function executeRule(current, previous /*null when async*/) {

	// Add your code here
		var ml_model_artifact = new GlideRecord('ml_model_artifact');
		gs.info(ml_model_artifact);
		ml_model_artifact.addQuery('solution', current.sys_id);
		ml_model_artifact.addQuery('model_id', 'ShapValuesOutput');
		ml_model_artifact.query();
		var model_artifact_sys_id = "nothing";
		if(ml_model_artifact.next()){
			model_artifact_sys_id = ml_model_artifact.getValue('sys_id');
		} else {
			model_artifact_sys_id = "no model artifact found";
		}
		gs.info("Model artifact sys id" + model_artifact_sys_id);
		var solutionSysID = model_artifact_sys_id;
		var attachment = new sn_ml_ui.GlideSysAttachment();
		var errMsg = "";
		try {
			var agr = attachment.getAttachments('ml_model_artifact', solutionSysID);
		} catch (error) {
			errMsg = gs.getMessage("Solution {0}: Error fetching shapValuesOutput attachment, failed with error {1}.", [solutionSysID, error]);
			gs.error(errMsg);
			throw new Error(errMsg);
		}
		try {
			if (agr.next()) {
				stats = JSON.parse(attachment.getContent(agr));
				gs.info(gs.getMessage('Solution {0}: Shap Values Output as read from file : {0}', [solutionSysID, JSON.stringify(stats)]));
		
			}
		} catch (error) {
			errMsg = gs.getMessage("Solution {0}: Incorrect format of the JSON in the artifact. Error: {1}.", [solutionSysID, error]);
			gs.error(errMsg);
			throw new Error(errMsg);
		}
		var gr = new GlideRecord('ml_solution_explainability');
		// Initialize GlideRecord to query the table
		gr.addQuery('solution_sys_id', current.sys_id);
		gr.query();

		if (gr.next()) {
			// Record with the same sys_id already exists, do nothing
			gs.getMessage('Record with sys_id {0} already exists.', [current.sys_id]);
		} else {
			// Record does not exist, proceed with insertion
			gr.initialize();
			gr.solution_sys_id = current.sys_id;
			gr.important_features = JSON.stringify(stats);
			gr.insert();
		};

})(current, previous);
