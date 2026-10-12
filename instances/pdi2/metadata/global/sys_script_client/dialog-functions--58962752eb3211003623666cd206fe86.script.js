function onLoad() {
}

var sc_ic_ItemDataDialog = Class.create({
	initialize: function (sysId) {
		this.defaultCallback = "refreshList";
		this.refreshType = "list";
		this.itemDataTableName = null;
		this.itemTableName = "sc_ic_item_staging";
		this.itemChangedTitle = "Your Item has changed";
		this.itemChangedMsg = "";
		this.dialogView = "";
		this.dialogAddTitle = "Add";
		this.dialogEditTitle = "Edit";
		this.dialogAction = "";
		this.dialogSize = {height: 700, width: 800};
		this.sysId = "-1";
		if (sysId)
			this.sysId = sysId;
	},
	
	process: function() {
		if (this.willStateChange() && this.hasFormChanged())
			this.promptForItemChanged();
		else if (this.willStateChange())
			this.display("refreshForm");
		else
			this.display();
	},
	
	createDialog: function() {
		this._dlg = new GlideDialogForm(this.dialogAddTitle, this.itemDataTableName);
		this._dlg.setDialogSize(this.dialogSize.width,this.dialogSize.height);
		this._dlg.setSysID(this.sysId);
		if (this.sysId != "-1")
			this._dlg.setTitle(this.dialogEditTitle);
		this._dlg.addParm("sysparm_view", this.dialogView);
		this._dlg.addParm("sysparm_query", this.itemTableName + "=" + g_form.getUniqueValue());
	},
	
	setDialogCallback: function(func) {
		if (func && typeof this[func] == "function")
			this._dlg.setCompletionCallback(this[func].bind(this));
		else if (typeof this[this.defaultCallback] == "function")
			this._dlg.setCompletionCallback(this[this.defaultCallback].bind(this));
	},
	
	display: function(callbackFunction) {
		this.createDialog();
		this.setDialogCallback(callbackFunction);
		this._dlg.setLoadCallback(this.afterDialogDisplayed.bind(this));
		this._dlg.render();
	},
	
	afterDialogDisplayed: function(iframeDoc) {
		var dialogFrame = 'defaultView' in iframeDoc ? iframeDoc.defaultView : iframeDoc.parentWindow;
		if (!dialogFrame)
			return;
		
		dialogFrame.$$("tr[id^=element.]").each(function (elmt) {
			elmt.select("A").each(function (elmt) {
				if (elmt.getAttribute("data-type") == "reference_popup")
					elmt.parentNode.removeChild(elmt);
				if (elmt.getAttribute("onclick") && elmt.getAttribute("onclick").indexOf("tearOffReference") == 0)
					elmt.parentNode.removeChild(elmt);
			});
		});
	},
	
	refreshList: function() {
		var relatedListName = this.itemTableName + "." + this.itemDataTableName + "." + this.itemTableName;
		GlideList2.getByName(relatedListName).refresh();
	},
	
	refreshForm: function() {
		g_form.modified = false;
		var mainFrame = getMainWindow();
		reloadWindow(mainFrame);
	},
	
	saveForm: function() {
		g_form.save();
	},
	
	willStateChange: function() {
		return g_form.getValue("state") == "published";
	},
	
	hasFormChanged: function() {
		return g_form.modified;
	},
	
	promptForItemChanged: function() {
		gsftConfirm(this.itemChangedTitle, this.itemChangedMsg, this.onPromptSave.bind(this), this.onPromptCancel.bind(this), this.onPromptDiscard.bind(this));
	},
	
	onPromptSave: function() {
		var afterSaveURL = new GlideURL();
		afterSaveURL.setFromCurrent();
		addHidden(g_form.getFormElement(), 'sysparm_goto_url', afterSaveURL.getURL({"sysparm_dialog_action" : this.dialogAction}));
		this.saveForm();
	},
	
	onPromptCancel: function() {
		return;
	},
	
	onPromptDiscard: function() {
		this.display("refreshForm");
	},
	
	type: "sc_ic_ItemDataDialog"
});

var sc_ic_showQuestionDialog = Class.create(sc_ic_ItemDataDialog, {
	initialize: function(sysId) {
		sc_ic_ItemDataDialog.prototype.initialize.call(this, sysId);
		this.itemDataTableName = "sc_ic_question";
		this.itemDataLabel = "Question";
		this.itemChangedMsg = "You've started making changes to your Item but adding a Question will also require your Item to be updated so what would you like to do?<ul>" +
						"<li><span style='font-weight:bold'>Don't Save</span><br/>This will lose any changes you've made to the Item when you add a new Question</li>" +
						"<li><span style='font-weight:bold'>Save</span><br/>This will save your changes before you add a new Question</li>" +
						"<li><span style='font-weight:bold'>Cancel</span><br/>This will take you back to the Item form</li></ul>";
		this.dialogView = "sc_ic_question_design";
		this.dialogAddTitle = "Add Question";
		this.dialogEditTitle = "Edit Question";
		this.dialogAction = "add_a_question";
	},
	
	type: "sc_ic_showQuestionDialog"
});

var sc_ic_showTaskDefnDialog = Class.create(sc_ic_ItemDataDialog, {
	initialize: function(sysId) {
		sc_ic_ItemDataDialog.prototype.initialize.call(this, sysId);
		this.itemDataTableName = "sc_ic_task_defn_staging";
		this.itemDataLabel = "Task";
		this.itemChangedMsg = "You've started making changes to your Item but adding a Task will also require your Item to be updated so what would you like to do?<ul>" +
						"<li><span style='font-weight:bold'>Don't Save</span><br/>This will lose any changes you've made to the Item when you add a new Task</li>" +
						"<li><span style='font-weight:bold'>Save</span><br/>This will save your changes before you add a new Task</li>" +
						"<li><span style='font-weight:bold'>Cancel</span><br/>This will take you back to the Item form</li></ul>";
		this.dialogView = "sc_ic_task_defn_design";
		this.dialogAddTitle = "Add Task";
		this.dialogEditTitle = "Edit Task";
		this.dialogAction = "add_a_task_defn";
		this.dialogSize = {height: 700, width: 800};
	},
	
	type: "sc_ic_showTaskDefnDialog"
});

var sc_ic_showApprovalDialog = Class.create(sc_ic_ItemDataDialog, {
	initialize: function(sysId) {
		sc_ic_ItemDataDialog.prototype.initialize.call(this, sysId);
		this.itemDataTableName = "sc_ic_aprvl_defn_staging";
		this.itemDataLabel = "Approval";
		this.itemChangedMsg = "You've started making changes to your Item but adding an Approval will also require your Item to be updated so what would you like to do?<ul>" +
						"<li><span style='font-weight:bold'>Don't Save</span><br/>This will lose any changes you've made to the Item when you add a new Approval</li>" +
						"<li><span style='font-weight:bold'>Save</span><br/>This will save your changes before you add a new Approval</li>" +
						"<li><span style='font-weight:bold'>Cancel</span><br/>This will take you back to the Item form</li></ul>";
		this.dialogView = "sc_ic_aprvl_defn_design";
		this.dialogAddTitle = "Add Approval";
		this.dialogEditTitle = "Edit Approval";
		this.dialogAction = "add_an_approval";
		this.dialogSize = {height: 470, width: 800};
	},
	
	type: "sc_ic_showApprovalDialog"
});

var sc_ic_showSectionDialog = Class.create(sc_ic_ItemDataDialog, {
	initialize: function(sysId) {
		sc_ic_ItemDataDialog.prototype.initialize.call(this, sysId);
		this.itemDataTableName = "sc_ic_section";
		this.itemDataLabel = "Section";
		this.itemChangedMsg = "You've started making changes to your Item but adding a Section will also require your Item to be updated so what would you like to do?<ul>" +
						"<li><span style='font-weight:bold'>Don't Save</span><br/>This will lose any changes you've made to the Item when you add a new Section</li>" +
						"<li><span style='font-weight:bold'>Save</span><br/>This will save your changes before you add a new Section</li>" +
						"<li><span style='font-weight:bold'>Cancel</span><br/>This will take you back to the Item form</li></ul>";
		this.dialogView = "sc_ic_section_design";
		this.dialogAddTitle = "Add Section";
		this.dialogEditTitle = "Edit Section";
		this.dialogAction = "add_a_section";
		this.dialogSize = {height: 290, width: 800};
	},
	
	type: "sc_ic_showSectionDialog"
});
