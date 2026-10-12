var ScanMuteRule = Class.create();
ScanMuteRule.prototype = Object.extendsObject(AbstractAjaxProcessor, {
 
	muteFindings: function() { 
		var muteReasonSysId = this.getParameter('sysparm_mute_reason_sys_id');
		var findingsSysIds = this.getParameter('sysparm_findings_sys_id');
		var findingsList = findingsSysIds.split(',');
		for (element in findingsList ) {
			var findingSysId = findingsList[element];
			var findingGR = new GlideRecord('scan_finding');
			if (findingGR.get(findingSysId)) {
				findingGR.scan_mute_rule = this._mute(findingGR.check, muteReasonSysId, findingGR.source_table, findingGR.source);
				findingGR.update();
			} 
		}
		
		var result = this.newItem("result");
		result.setAttribute("message", gs.getMessage('You have muted the selected finding(s) for future scans.'));
		return result;
	},

	_mute: function(check, muteReason, sourceTable, source) {
		gr = new GlideRecordSecure('scan_mute_rule');
		gr.addQuery('check', check);
		gr.addQuery('source_table', sourceTable);
		gr.addQuery('source', source);
		gr.query();

		if (gr.next()) {
			gr.mute_reason = muteReason;
			return gr.update();
		} else {
			gr.initialize();
			gr.check = check;
			gr.mute_reason = muteReason;
			gr.source_table = sourceTable;
			gr.source = source;
			gr.active = true;
			return gr.insert();
		}
	},
	
	type:"ScanMuteRule"
 });
