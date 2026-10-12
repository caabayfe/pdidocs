var UpgradePlanProgressViewerUtil = Class.create();
UpgradePlanProgressViewerUtil.prototype = {

	initialize: function() {
	},

	renderProgressViewer: function(title, progressId) {
		var self = this;
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var modal = new dialogClass('hierarchical_progress_viewer', false, '40em', '10.5em');
	
		modal.setTitle(title);
		modal.setPreference('sysparm_renderer_execution_id', progressId);
		modal.setPreference('sysparm_button_close', new GwtMessage().getMessage('Close'));
		modal.setPreference('sysparm_renderer_hide_drill_down', true);
	
		modal.on('bodyrendered', function() {
			self.disableModalCloseButton();
		});
	
		modal.on('renderStatus', function(statusObject) {
			self.addResultButtonIfApplicable(statusObject);
			self.addViewDetailsButtonIfApplicable(statusObject, progressId, modal);
		});
	
		modal.on('executionComplete', function() {
			self.updateModalButtons(modal);
		});
	
		modal.render();
	},

	addResultButtonIfApplicable: function(statusObject) {
		if (!this.isUpgradePlanComplete(statusObject))
			return;

		addButtonToProgressFooter(this.createResultButton(statusObject.result.upgradePlanSysId));
	},

	addViewDetailsButtonIfApplicable: function(statusObject, progressId, modal) {
		if (statusObject && statusObject.result && statusObject.result.succeedWithWarning && !$('sysparm_button_view_details') && !modal.title.includes(' - Execution Details'))
			addButtonToProgressFooter(this.createViewDetailsButton(progressId, modal));
	},

	disableModalCloseButton: function() {
		var closeBtn = $('sysparm_button_close');
		if (closeBtn)
			closeBtn.disable();
	},

	isUpgradePlanComplete: function(statusObject) {
		return statusObject && statusObject.result && statusObject.result.upgradePlanSysId && !$('sysparm_button_result_page');
	},

	createResultButton: function(upgradePlanSysId) {
		var resultButton = new Element('button', {
			'id': 'sysparm_button_result_page',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(new GwtMessage().getMessage('Go to Upgrade Plan'));

		resultButton.onclick = function() {
			window.location = 'sys_upgrade_plan.do?sys_id=' + upgradePlanSysId;
		};

		return resultButton;
	},

	createViewDetailsButton: function(progressId, modal) {
		var viewDetailsButton = new Element('button', {
			'id': 'sysparm_button_view_details',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(new GwtMessage().getMessage('View Details'));

		viewDetailsButton.onclick = function() {
			modal.setPreference('sysparm_renderer_hide_drill_down', false);
			modal.setTitle(modal.title + ' - Execution Details');
			modal.render();
		};
		return viewDetailsButton;
	},

	updateModalButtons: function(modal) {
		var closeBtn = $('sysparm_button_close');
		if (closeBtn) {
			closeBtn.onclick = function() {
				modal.destroy();
				reloadWindow(window);
			};
		}

		var resultBtn = $('sysparm_button_result_page');
		if (resultBtn)
			resultBtn.className += ' btn-primary';

		var viewDetailsBtn = $('sysparm_button_view_details');
		if (viewDetailsBtn)
			viewDetailsBtn.className += ' btn-secondary';
	},

	type: 'UpgradePlanProgressViewerUtil'
};
