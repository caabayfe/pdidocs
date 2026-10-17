function SkippedRecordRuleEngineUtils() {

 // for List view
    function runSelectedActiveRulesOnLastUpgrade() {
		var activeRuleIds = getListOfSelectedActiveRules();
		var title = getMessage('Are you sure you want to run rule(s)?');
		var param = new GwtMessage().getMessage('RunRules');
		showConfirmDialogAndTriggerRule(title, param, activeRuleIds, null, true);
    }

// for Form view
   function runRuleOnLastUpgrade(ruleId) {
		var title = getMessage('Are you sure you want to run rule?');
		var param = new GwtMessage().getMessage('RunNow');
		showConfirmDialogAndTriggerRule(title, param, ruleId, null, true);
    }

// for system upgrade
     function runActiveRulesOnGivenUpgradeHistoryId(upgradeHistorySysId) {
		var title = getMessage('Are you sure you want to run rule(s)?');
		var param = new GwtMessage().getMessage('RunRules');
		showConfirmDialogAndTriggerRule(title, param, null, upgradeHistorySysId, false);
    }

    function showConfirmDialogAndTriggerRule(title, param, ruleIds, upgradeHistorySysId, showUpgradeLink) {
      var gm = new GlideModal('skipped_record_run_rules_confirm_modal');
		gm.setTitle(title);
		gm.setPreference('sysparm_message', param);
		gm.setPreference('sysparm_showlink', showUpgradeLink);

		gm.setWidth(450);
		gm.on('beforeclose', function() {
        if ($j('#confirmModalAction').val() == 'execute') {
                triggerRule(ruleIds, upgradeHistorySysId);
			}
		});
		gm.render();
    }


    function triggerRule(ruleIds, upgradeHistorySysId) {
        var ga = new GlideAjax('SkippedRecordRuleUtil');
		ga.addParam('sysparm_name', 'triggerRules');
		if(ruleIds != null)
			ga.addParam('sysparm_sysIds', ruleIds);

		if(upgradeHistorySysId != null)
			ga.addParam('sysparm_upgradeHistorySysId', upgradeHistorySysId);
		ga.getXML(handleTriggerRulesResponse);
    }


	function getListOfSelectedActiveRules() {
		var selSysIds = g_list.getChecked();
		var sysIdList;
		if(selSysIds && selSysIds.length > 0) {
			sysIdList = selSysIds.split(',');
		}
		var activeRuleSysIds = [];
		var gr = new GlideRecord('sys_upgrade_skipped_record_rule');
		if(sysIdList && sysIdList.length > 0)
			gr.addQuery('sys_id','IN',sysIdList);
		gr.addQuery('active', true);	
		gr.query();

		while (gr.next()) {
			activeRuleSysIds.push(gr.getValue("sys_id"));
		}
		return activeRuleSysIds;
    }

	function handleTriggerRulesResponse(response) {
		var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
		if (result && result.errorMessage) {
			showErrorMessage(result.errorMessage);
			return;
		}
		
		if(result && result.progressId)
			renderProgressViewer(new GwtMessage().getMessage('Rules Execution Progress'), result.progressId);
	}

	function showErrorMessage(errorMessage) {
		var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form; // support for list and form
		glideForm.addErrorMessage(errorMessage);
	}


	function renderProgressViewer(title, progressId) {
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var modal = new dialogClass('hierarchical_progress_viewer', false, '40em', '10.5em');
	
		modal.setTitle(title);
		modal.setPreference('sysparm_renderer_execution_id', progressId);
		modal.setPreference('sysparm_button_close', new GwtMessage().getMessage('Close'));
		modal.setPreference('sysparm_renderer_expanded_levels', '0');

		modal.on('bodyrendered', function() {
			new UpgradePlanProgressViewerUtil().disableModalCloseButton();
		});

		modal.on('executionComplete', function() {
			new UpgradePlanProgressViewerUtil().updateModalButtons(modal);
		});
	
		modal.render();
	}

    return {
        runRuleOnLastUpgrade: runRuleOnLastUpgrade,
        runActiveRulesOnGivenUpgradeHistoryId: runActiveRulesOnGivenUpgradeHistoryId,
        runSelectedActiveRulesOnLastUpgrade: runSelectedActiveRulesOnLastUpgrade,
        type: 'SkippedRecordRuleEngineUtils'
    };
}
