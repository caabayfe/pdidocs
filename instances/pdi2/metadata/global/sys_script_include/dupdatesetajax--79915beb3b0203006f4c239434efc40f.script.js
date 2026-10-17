var DUpdatesetAjax = Class.create();

(function() {

	var um,
		exported = 0,
		exportedMap = { },
		outputSkipped = 0,
		result = { msgs: [ ] };

	DUpdatesetAjax.prototype = Object.extendsObject(AbstractAjaxProcessor ,{

		ajaxFunction_getUpdateSet: function() {

			try {
				var statusId, source, gr, dhGr, us, updateSetSysId, currentSysId,
					eccSysIds = this.getParameter('sysparm_ecc_sys_id'),
					updateSetName = 'export_Replay_' + this.getParameter('sysparm_updateset_name'),
					usGr = new GlideRecord('sys_update_set');

				eccSysIds = eccSysIds.split(',');

				usGr.name = updateSetName;
				usGr.setValue('state', 'in progress');
				updateSetSysId = usGr.insert();
				result.updateSetSysId = updateSetSysId;

				// We can't use GlideUpdateManager2(String) on developer instances.  In this
				// case we'll use GlideUpdateSet to change to our new update set before
				// adding records and to change back when we're done with it.  I don't want
				// to always change update sets because doing so puts an info message on the
				// screen.
				try {
					um = new GlideUpdateManager2(updateSetSysId);
				} catch (e) {
					currentSysId = gs.getPreference('sys_update_set');
					us = new GlideUpdateSet();
					us.set(updateSetSysId);
					um = new GlideUpdateManager2();
				}

				// Add input ecc queue and related records to the update set
				eccSysIds.forEach(function(eccSysId) { addEccRecToUpdateSet(eccSysId); });

				gr = new GlideRecord('sys_update_set');
				if (updateSetSysId)
					gr.get('sys_id', updateSetSysId);
				gr.state = 'complete';
				gr.update();

				var updateSetExport = new UpdateSetExport();
				result.exportSysId = updateSetExport.exportUpdateSet(usGr);

				if (outputSkipped)
					result.msgs.push('Skipped ' + outputSkipped + ' output records');

				if (exported)
					result.msgs.push('Exported ' + exported + ' records.');
				else
					result.msgs.push('Warning: no records exported');

				// Delete the update set we just exported
				gr.deleteRecord();

				us && us.set(currentSysId);

			} catch (e) {
				result.msgs.push(e.toString());
			}

			return JSON.stringify(result);
		},

		ajaxFunction_deleteUpdateSet: function() {
			var gr,
				updateSetSysId = this.getParameter('sysparm_updateset_sysid'),
				updateSetName = 'export_Replay_' + this.getParameter('sysparm_updateset_name'),
				msgs = this.getParameter('sysparm_messages');

			if (msgs)
				msgs.split(',').forEach(function(msg) { gs.addInfoMessage(msg); });

			gr = new GlideRecord('sys_remote_update_set');
			if (updateSetSysId && gr.get('sys_id', updateSetSysId))
				gr.deleteRecord();
			else
				gs.addInfoMessage(gs.getMessage('Unable to delete sys_remote_update_set {0}', updateSetSysId));
		},

		type: 'DUpdatesetAjax'
	});

	function addEccRecToUpdateSet(eccSysId) {
		var dhGr,
			gr = addToUpdateSet('ecc_queue', eccSysId);

		if (!gr)
			return;

		// If the record is a pattern, it may be multipaged and need the other related ecc_queue inputs
		if (gr.topic == 'HorizontalDiscoveryProbe') {
			multiPagedGrs = new GlideRecord('ecc_queue');
			multiPagedGrs.addQuery('response_to', gr.response_to);
			multiPagedGrs.addQuery('agent_correlator', gr.agent_correlator);
			multiPagedGrs.addQuery('sys_id', '!=', eccSysId);
			multiPagedGrs.query();
			
			while (multiPagedGrs.hasNext())
				addToUpdateSet(multiPagedGrs);
		}
		
		// Add the discovery status to the update set
		addToUpdateSet('discovery_status', gr.agent_correlator);

		// Add DeviceHistoryRecord to the UpdateSet
		dhGr = new GlideRecord('discovery_device_history');
		dhGr.addQuery('status', gr.agent_correlator + '');
		dhGr.addQuery('source', gr.source + '');
		dhGr.query();
		dhGr = addToUpdateSet(dhGr);

		// Add the Ci Record to the updateSet
		if (dhGr)
			addToUpdateSet((dhGr.classified_as || 'cmdb_ci') + '', dhGr.cmdb_ci + '');
	}

	function addToUpdateSet(gr, sysid) {
		var tableName;

		if (typeof gr == 'string') {
			tableName = gr;
			gr = new GlideRecord(tableName);
			if (!sysid || !gr.get('sys_id', sysid)) {
				result.msgs.push('Unable to add ' + tableName + ' ' + sysid + ' to update set');
				return;
			}
			if (gr.queue == 'output') {
				outputSkipped++;
				return;
			}
		} else if (!gr.next())
			return;

		// We'll only attempt to export a record once.
		if (exportedMap[gr.sys_id])
			return;

		exportedMap[gr.sys_id] = 1;

		um.saveRecord(gr);
		exported++;
		return gr;
	}

})();
