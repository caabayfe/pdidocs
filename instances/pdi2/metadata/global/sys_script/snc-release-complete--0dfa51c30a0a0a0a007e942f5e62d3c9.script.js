gs.log("SNC Release Complete starting");

var msg = 'Release '+current.name.getDisplayValue()+' for Product ' + current.product.getDisplayValue() + ' is complete';
closeRelatedGivenRelease(current, msg);
postDSL(current);

gs.log("SNC Release Complete ending");

// Find all related problems and close them
function closeRelatedGivenRelease(me, msg) {
	var features = new GlideRecord('release_feature');
	features.addQuery('release', '=', me.sys_id);
	features.query();
	while (features.next()) {
		closeRelatedGivenFeature(features, msg);
	}
}


// Find related problems for a feature and close them
function closeRelatedGivenFeature(me, msg) {
	if (!me.rfc.isNil()) {
		var rfc = new GlideRecord('change_request');
		if (rfc.get('sys_id', me.rfc)) {
			var chgReq = new ChangeRequest(rfc);
			if (!chgReq.isClosed()) {
				var notes = rfc.close_notes.getDisplayValue();
				notes = notes + '\n' + (JSUtil.notNil(msg) ? msg : gs.getMessage("Closed"));
				rfc.close_notes =  notes;
				chgReq.close();
				rfc.update();
			}
			if (!pm.isActive('com.snc.best_practice.problem.madrid.state_model'))
				closeRelatedGivenChange(rfc, msg);
		}
	}
}

// Find related problems for a change_request and close them
function closeRelatedGivenChange(me, msg) {
	var problems = new GlideRecord('problem');
	problems.addQuery('rfc', '=', me.sys_id);
	problems.query();
	while (problems.next()) {
		problems.problem_state.setValue(4);
		var notes = problems.close_notes.getDisplayValue();
		notes = notes + '\n' + msg;
		problems.close_notes.setValue(notes);
		problems.update();
	}
}

// Post all entries in the Definitive Software Library
function postDSL(me) {
	var relatedCI = new GlideRecord('release_cis');
	relatedCI.addQuery('release', '=', me.sys_id);
	relatedCI.query();
	while (relatedCI.next()) {
		gs.print("updating using ci "+relatedCI.ci_item);
		postDSLGivenCI(relatedCI.ci_item, me.sys_id);
	}
	var features = new GlideRecord('release_feature');
	features.addQuery('release', '=', me.sys_id);
	features.query();
	while (features.next()) {
		postDSLGivenFeature(features, me.sys_id);
	}
}

function postDSLGivenFeature(me, release) {
	if (!me.rfc.isNil()) {
		var rfc = new GlideRecord('change_request');
		if (rfc.get('sys_id', me.rfc)) {
			if (!rfc.cmdb_ci.isNil()) {
				postDSLGivenCI(rfc.cmdb_ci, release);
			}
		}
	}
}



// Post all entries in the Definitive Software Library
function postDSLGivenCI(ciID, release) {
	var cmdbci = new GlideRecord('cmdb_ci');
	if (cmdbci.get('sys_id', ciID)) {
		var dsl = new GlideRecord('dsl');
		dsl.addQuery('ci', '=', cmdbci.sys_id);
		dsl.query();
		while (dsl.next()) {
			dsl.pending = release;
			dsl.pending_date = gs.now();
			dsl.update();
		}
	}
}
