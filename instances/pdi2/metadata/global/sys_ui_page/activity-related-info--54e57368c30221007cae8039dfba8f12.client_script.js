function ari_dialog_done() {
   //This script is called when the user clicks "OK" in the dialog window
   //Close the dialog window
   GlideDialogWindow.get().destroy();
}

(function(){
	function versionLinkEventHandler(event) {
		event.preventDefault();
		var a = $j(this);
		var sys_id = a.attr('sys_id');
		var uuid = guid();
		if (!workflowIde.deDuper.add(sys_id, uuid)) {
			workflowIde.tabs.activateTab(workflowIde.deDuper.find(sys_id));
		} else {
			var tabname = a.html();
			var href = a.attr('href');
			var version = a.parent('td').parent('tr').find('td').eq(3).text();
			if (isMSIE8)
				version = a.parent('td').parent('tr').find('td').eq(2).text();
			
			tabname += " - version " + version;
			workflowIde.tabs.addTabIframe(
				tabname,
				href,
				{icon:        "/images/heisenberg_icons/workflow/activity.png",
				 iframeclass: "activity-properties",
				 frameonload: function(element, tab) {workflowIde.newActivityTabOnLoad(element, tab, true);},
				 tabactivate:   workflowIde.activityTabActivate.bind(workflowIde),
				 tabdeactivate: workflowIde.activityTabDeactivate.bind(workflowIde),
				 title:         getMessage("Activity Designer"),
				 active:        true,
			 	deletecheck:   workflowIde.activityCloseCheck.bind(workflowIde),
				 uuid: uuid,
				 ondelete: function(tab){workflowIde.deDuper.remove(uuid);}});
	    }
		GlideDialogWindow.get().destroy();
	}

	function historyLinkEventHandler(event) {
		event.preventDefault();
		var a = $j(this);
		var href = a.attr('href');
		var sys_id = href.replace(/.+sys_id=(\w*)&?.*/, "$1");
		var uuid = guid();
		if (!workflowIde.deDuper.add(sys_id, uuid)) {
			workflowIde.tabs.activateTab(workflowIde.deDuper.find(sys_id));
		} else {
			var tr = a.parent('td').parent('tr');
			var workflow = tr.find('td').eq(2).text();
			var context = tr.find('td').eq(1).text();
			var tabname = workflow + " - " + context;
			workflowIde.tabs.addTabIframe(
				tabname,
				href,
				{icon:        "/images/heisenberg_icons/workflow/workflow.png",
				 iframeclass: "activity-properties",
				 frameonload: function(element, tab) {workflowIde.genericIFrameOnLoad(element);},
				 active: true,
				 uuid: uuid,
				 ondelete: function(tab){workflowIde.deDuper.remove(uuid);}});
		}
		GlideDialogWindow.get().destroy();
	}

	function usedInLinkEventHandler(event) {
		event.preventDefault();
		var a = $j(this);
		var sys_id = a.attr('sys_id');
		if (workflowIde.deDuper.find(sys_id)) {
			workflowIde.tabs.activateTab(workflowIde.deDuper.find(sys_id));
		} else {
			workflowIde.newCanvas('Drawing Canvas', sys_id, 'load');
		}
		GlideDialogWindow.get().destroy();
	}

	function fixTableLinks(selector, processor, handler) {
		$j(selector).find('table.list_table').find('tbody > tr').each(function() {
			var tr = $j(this);
			tr.find('a.linked[href*="' + processor + '.do?"]').on('click', handler);
			tr.find('a.linked:not([href*="' + processor + '.do?"])').each(function() {
				var a = $j(this);
				var td = $j(a.parent('td'));
				td.html(a.text());
			});
		});
	}

	var versionsTxt = getMessage('Versions');
	var historyTxt = getMessage('History (Past Contexts)');
	var usedInTxt = getMessage('Used In');
	var vuuid = guid();
	var huuid = guid();
	var uuuid = guid();
	var workflowIde = window.parent.workflowIDE;
	var relatedTabs = new WorkflowTabs('relatedTabs', 'relatedTabs')
		.addTab(versionsTxt, '', {permanent:true, active: activeTab == versionsTxt, uuid: vuuid})
		.addTab(historyTxt,  '', {permanent:true, active: activeTab == historyTxt,  uuid: huuid})
		.addTab(usedInTxt,   '', {permanent:true, active: activeTab == usedInTxt,   uuid: uuuid});

	if (window.parent.canvasTabs) {
		fixTableLinks('#VersionList', 'wf_element_definition', versionLinkEventHandler);
		fixTableLinks('#HistoryList', 'wf_context',            historyLinkEventHandler);
		fixTableLinks('#UsedInList',  'wf_workflow_version',   usedInLinkEventHandler);
	}
	$j('#VersionList').appendTo(relatedTabs.getContentRef(vuuid));
	$j('#HistoryList').appendTo(relatedTabs.getContentRef(huuid));
	$j('#UsedInList').appendTo(relatedTabs.getContentRef(uuuid));
})()
