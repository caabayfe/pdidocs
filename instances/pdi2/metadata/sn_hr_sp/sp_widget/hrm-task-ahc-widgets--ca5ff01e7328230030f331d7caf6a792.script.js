(function() {
	data.isMobile = gs.isMobile();
	//Hiding `Ask a question` for ASC Alumni users 
	data.showConnect = gs.getUser().getRoles().indexOf("sn_asc.alumni") == -1;
	data.isConnectConfigured = false; // default false until configured
	if (options && options.sysId && options.table) {
				data.sys_id = options.sysId;
				data.table = options.table;
				data.onTicketPage = options.onTicketPage || false;
				data.validTask = options.validTask || false;
				data.validApproval = options.validApproval || false;
				data.approvalChildTask = options.approvalChildTask;
	} else if (input && input.sysId && input.table) {
				data.sys_id = input.sysId;
				data.table = input.table;
				data.onTicketPage = input.onTicketPage || false;
				data.validTask = input.validTask || false;
				data.validApproval = input.validApproval || false;
				data.approvalChildTask = input.approvalChildTask;
	} else
		return;
	if (data.sys_id && data.table) {
		data.widgets = {};
		var taskGr = new GlideRecord(data.table);
		if (taskGr.get(data.sys_id)) {
			if (isValidHRTask()) {
				// Use HR dependent features
				if (data.validApproval) {
					// Use approval child task for portalUtils, since an approval isn't a task
					var connectTaskGr = new GlideRecord(data.approvalChildTask.taskTable);
					connectTaskGr.get(data.approvalChildTask.taskSysId);
					setupConnect(connectTaskGr);
				} else {
					setupConnect(taskGr);
				}
				data.showAttachmentGallery = true;
			} else {
				// No HR dependent features
				data.showConnect = false;
				data.taskNumber = String(taskGr.number);
				data.showAttachmentGallery = false;
			}
			var taskAcvtyOptions = {};
			taskAcvtyOptions.sys_id = data.sys_id;
			taskAcvtyOptions.table = data.table;
			taskAcvtyOptions.record_id = taskAcvtyOptions.sys_id;
			taskAcvtyOptions.record_table= taskAcvtyOptions.table ;
			taskAcvtyOptions.title = gs.getMessage("History");
			data.widgets.historyWidget = $sp.getWidget('widget-ticket-conversation', taskAcvtyOptions);
			if(data.isMobile)
				taskAcvtyOptions.appendToId = "attachments_popup";

			if (data.showAttachmentGallery) {
				data.ticketAttachmentGalleryWidget = $sp.getWidget('widget-ticket-attachment-gallery', {
					ticket_sys_id: data.sys_id,
					ticket_table: taskGr.getValue('sys_class_name') || data.table,
					can_attach: false, // upload always disabled in SP
					can_write: taskGr.canWrite(),
					can_read: taskGr.canRead(),
					profiles: [{
						condition: {
							breakpoint: data.isMobile ? 9e9 : 767 // viewportWidth < 767px: mobile device or small screen
						},
						options: {
							empty_list_text: gs.getMessage('There are no attachments'),
							max_thumbnails: 10
						}
					}, {
						condition: {
							breakpoint: 1200 // viewportWidth < 1200px: Desktops, medium screens
						},
						options: {
							max_thumbnails: 2
						}
					}]
				});
			}
		}
	}
	
	function setContextVariables(portalTaskGr,portalUtils) {
		data.task_sys_id = portalTaskGr.getUniqueValue();
		data.parent_case_sys_id = portalTaskGr.getValue('parent');
		data.hr_case_coe = portalUtils.getHrCaseCoe(data.parent_case_sys_id);
		data.task_number = portalTaskGr.getDisplayValue('number');
		data.parent_case_table_name = portalUtils.getHrCaseTableName(data.parent_case_sys_id);
		data.task_awa_queue = portalUtils.getTaskAWAQueue();
		data.isConversationActive = portalUtils.checkForActiveChat();
		var context = new hr_PortalUtil().getSearchContext($sp);
		data.isNASSEnabled = context.isNASSEnabled;
		data.search_text = context.search_text;
	}
	
	function setupConnect(connectTaskGr) {
		var portalUtils = new sn_hr_sp.hr_PortalUtil(connectTaskGr);
		data.showConnect = data.showConnect && portalUtils.isAskAQuestionVisible(connectTaskGr);
		data.taskNumber = String(connectTaskGr.number);
		if (!data.validTask && !data.validApproval) {
			var connectChatConfig = data.showConnect && portalUtils.getConnectChatConfiguration(connectTaskGr);
			if(connectChatConfig == null)
				data.chatConfigError = true;
			else
				data.isConnectConfigured = connectChatConfig;
			var chatOptions = portalUtils.getChatWidgetParams(connectTaskGr);
			if (!gs.nil(chatOptions) && data.isConnectConfigured)
				data.widgets.chatWidget = $sp.getWidget('sn-chat', chatOptions);
			else
				setContextVariables(connectTaskGr, portalUtils);
		}
	}
	
	function isValidHRTask(){
		if (!GlidePluginManager.isActive('com.sn_hr_core'))
			return false;
		return data.table === "sn_hr_core_task" || data.table === "sn_doc_task";
	}
})();
