var ChecklistUtil = Class.create();
ChecklistUtil.prototype = {
    initialize: function() {
    },
	
	hasChecklistItems : function(checklistGR) {
		if(this.hasChecklist(checklistGR)) {
			var items = new GlideRecord("checklist_item");
			items.addQuery("checklist", checklistGR.sys_id);
			items.query();
			if (items.getRowCount() > 0) 
				return true;
			return false;
		}
		return false;
	},
	
	hasTemplates : function() {
		var temp = new GlideRecord("checklist_template");
		temp.query();
		if (temp.next())
			return true;
		return false;
	},
	
	hasChecklist : function (checklistGR) {
		var sysID = checklistGR.sys_id + '';
		return (new GlideStringUtil()).isEligibleSysID(sysID);
	},
	
	createChecklistFromTemplate: function(templateSysId, taskTable, taskSysId){
		if(!templateSysId || !taskTable || !taskSysId)
			throw new Error(gs.getMessage("One or more required inputs are missing"));
		
		var templateGr = new GlideRecord('checklist_template');
		templateGr.get(templateSysId);
		var template = templateGr.getValue('template');
		
		if(!template)
			throw new Error(gs.getMessage("Invalid checklist template"));
		
		var json = new global.JSON();
		var itemJSON = json.decode(template);
		var name = itemJSON['name'];
		var items = itemJSON['items'];
		var owner = itemJSON['owner'];
		var checklistId = '';

		var grList = new GlideRecord('checklist');
		grList.addQuery('document', taskSysId);
		grList.addQuery('table', taskTable);
		grList.query();
		if(grList.next())
			throw new Error(gs.getMessage("This task already contains a checklist"));
		
		
		grList.document = taskSysId;
		grList.name = name;
		grList.owner = owner;
		grList.table = taskTable;
		checklistId = grList.insert();

		for (var i = 0; i < items.length; i++) {
			var grItem = new GlideRecord('checklist_item');
			grItem.checklist = checklistId;
			grItem.complete = false;
			grItem.name = items[i]['name'];
			grItem.order = items[i]['order'];
			grItem.insert();
		}
		
		return items.length;
	},
	
    type: 'ChecklistUtil'
};
