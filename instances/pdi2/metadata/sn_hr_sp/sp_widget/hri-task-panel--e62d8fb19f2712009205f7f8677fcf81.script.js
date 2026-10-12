(function () {

	var filterBySysid = 'sys_idIN';
	var filterByParent = 'parentIN';

	data.caseType = 'sn_hr_core_case';
	data.taskType = 'sn_hr_core_task';
	data.scType = 'sc_request';
	data.scReqType = 'sc_req_item';
	data.allTypes = data.caseType + ',' + data.taskType + ',' + data.scType + ',' + data.scReqType;
	data.user = gs.getUserID();
	data.filterSelf = {};
	data.filterParent = {};
	data.filterList = [];
	data.filters = '';
	data.myTaskCount = 0;
	data.table = 'task';

	// load parameter record
	if (input) {
		if (!input.updated_record)
			return;

		data.current = input.sys_id;
		if (input.selectedTask)
			data.selectedTask = input.selectedTask;
		else
			data.current = input.sys_id;
	}	else {
		data.current = $sp.getParameter("sys_id");
		data.selectedTask = data.current;
	}

	data.sysId = data.current; 

	// Last sanity check
	if (!data.current || !data.table)
		return;
	
	var stateMap = {};
	var stateIconMap = {};


	// Determine of we are looking at a task or a case; handle them:
	// - case_type shows parent child tree relationship below case 
	// - task_type shows list of my tasks
	var task = new GlideRecordSecure(data.table);
	if (!task.get(data.current)) {
		data.isValid = false; // widget content only shows when data.isValid = true
		return;
	} else
		data.isValid = true;

	data.secondary_fields = [ 'number', 'assigned_to' ];

	// if case_type, show my case, child cases and child tasks
	if (task.sys_class_name.indexOf(data.caseType) > -1) {
		data.show = 'case';
		data.parent = getParentCase(data.current);
		data.list = getChildList(data.current);
		if (data.list.length > 0)
			data.title = gs.getMessage('Tasks');
		else 
			data.title = gs.getMessage('Task');
		// Set up record Watcher filters
		setRWFilter(filterBySysid, data.filterSelf);
		setRWFilter(filterByParent, data.filterParent);
	} else if(task.sys_class_name == data.taskType) {
		data.show = 'mytasks'; 
		data.list = getMyTasksList();	
		if (data.list.length > 1)
			data.title = gs.getMessage('Tasks');
		else 
			data.title = gs.getMessage('Task');
		if(taskHasCI(task.sys_id))
			data.ciFromTask = getCIFromTask(task.sys_id);
		data.filterList.push('assigned_to='+data.user);
	} else {
		//Catch all task types
		data.show = 'case';
		data.parent = getParentCase(data.current);
		data.title = gs.getMessage('Task');
		data.list = getChildList(data.current);
		if (data.list.length > 0)
			data.title = gs.getMessage('Tasks');
		else 
			data.title = gs.getMessage('Task');
		// Set up record Watcher filters
		setRWFilter(filterBySysid, data.filterSelf);
		setRWFilter(filterByParent, data.filterParent);
	}

	// Set first in list to be selected, if current not already set
	if (!data.current && data.list && data.list.length > 0)
		data.current = data.list[0].sys_id;

	function setRWFilter(preamble, filter) {
		var f = Object.keys(filter);
		if(f.length > 0)	
			data.filterList.push(preamble + f.join());
	}

	function isValidInput(input) {
		return input && input.updated_record;
	}

	function taskHasCI(id) {
		var gr = new GlideRecord('sn_hr_core_task');
		gr.get(id);
		if (gr.hr_service)		
			return true;
		return false;
	}

	function getRecord(gr) {
		var record = {};

		record.sys_id = gr.getValue('sys_id');
		record.assigned_to = gr.getValue('assigned_to');
		if (record.assigned_to == data.user)
			data.myTaskCount++;

		/*Set Image*/
		var className = gr.sys_class_name;
		var stateField = getStateField(className);
		
		//Need to get the record inorder to get value of fields from extended tables
		var rec = new GlideRecord(className);
		rec.get(gr.sys_id);
		record.image_title = rec.getDisplayValue(stateField); 
		record.image_field = getIcon(className, rec.getValue(stateField));
		
		if (options.display_field)
			record.display_field = getField(gr, options.display_field);
		//Set number as the display value if display field is not specified or display field value is empty
		if (!record.display_field)
			record.display_field = getField(gr, "number");

		record.secondary_fields = [];
		data.secondary_fields.forEach(function(f) {
			var fields = getField(gr, f);
			if (fields != null)
				record.secondary_fields.push(fields);
		});

		if (!data.filterParent.hasOwnProperty(record.sys_id))
			data.filterSelf[record.sys_id] = '';

		return record;
	}
	
	function getStateField(className) {		
		//set class to sn_hr_core_case if the record is a child of sn_hr_core_case
		if (className.indexOf(data.caseType) > -1)
			className = data.caseType;
		
		if (className in stateMap) 
			return stateMap[className];
		else 
			return;
	}
	
	function getIcon(className, state) {
		//set class to sn_hr_core_case if the record is a child of sn_hr_core_case
		if (className.indexOf(data.caseType) > -1)
			className = data.caseType;
		
		if (state in stateIconMap[className])
			return stateIconMap[className][state];
		else 
			return stateIconMap[className]['default'];
	}

	function getParentCase(sys_id) {
		var gr = new GlideRecordSecure(data.table); // does ACL checking for us
		if (!gr.get(sys_id)) {
			data.isValid = false;
			return;
		} else
			data.isValid = true;

		setCaseTypeAndLoadMappings(gr);
		return getRecord(gr);
	}

	function getCIFromTask(taskId){
		var task = new GlideRecord('sn_hr_core_task');
		task.get(taskId);
		if (task.hr_service)
			return getProducerId(task.hr_service);
		return false;
	}

	function getProducerId(service){
		var serviceGr = new GlideRecord("sn_hr_core_service");
		if (serviceGr.get(service))
			return serviceGr.getValue("producer");
		gs.addErrorMessage(gs.getMessage("Service not found"));
		return false;
	}

	function getMyTasksList() {
		var list = [];
		var encodedString = 'sys_class_nameIN' + data.taskType;

		var gr = new GlideRecordSecure(data.taskType); // does ACL checking for us
		if (!gr.isValid()) {
			data.isValid = false;
			return;
		} else
			data.isValid = true;

		gr.addQuery('assigned_to', data.user);
		gr.addQuery("parent.state", '!=', '1');
		gr.addQuery('parent.active', 'true');
		gr.addEncodedQuery(encodedString);
		gr.orderBy('due_date');
		gr.orderByDesc('sys_created_on');
		gr.query();

		while (gr.next()) {
			setCaseTypeAndLoadMappings(gr);
			if (!ignoreRecord(gr))
				list.push(getRecord(gr));
		}

		return list;
	}
	
	function setCaseTypeAndLoadMappings(gr) {
		if (gr.sys_class_name != data.taskType)	
			data.caseType = gr.sys_class_name;
		stateMap = createStateMap();
		stateIconMap = createStateIconMap();
	}

	function getChildList(sys_id) {
		var encodedString = 'sys_class_nameIN'+data.allTypes+'^ORsys_class_nameLIKE' + data.caseType;
		var childCases = [];
		var gr = new GlideRecordSecure(data.table); // does ACL checking for us
		if (!gr.isValid()) {
			data.isValid = false;
			return;
		} else
			data.isValid = true;
		gr.orderBy('due_date');
		gr.orderByDesc('sys_created_on');
		gr.addQuery('parent', sys_id);
		gr.addEncodedQuery(encodedString);		
		gr.query();

		if (gr.hasNext()) {
			data.filterParent[sys_id] = '';
			if (data.filterSelf.hasOwnProperty(sys_id))
				delete data.filterSelf[sys_id];
		}

		while (gr.next()) {
			if (ignoreRecord(gr))
				continue;

			var record = getRecord(gr);
			record.children = getChildList(record.sys_id);

			childCases.push(record);
		}

		return childCases;
	}

	function getField(gr, name) {
		var f = {};

		f.display_value = gr.getDisplayValue(name);
		f.value = gr.getValue(name);

		var ge = gr.getElement(name);
		if (ge == null)
			return f;

		f.type = ge.getED().getInternalType();
		if (name != 'number') 
			f.label = ge.getLabel();

		if (name == 'assigned_to' && gr.getValue(name) == null) {
			f.display_value = "";
			f.value = "unassigned";
			f.label = "";
		}

		if (!f.display_value && !f.value)
			return null;
		if (!f.display_value.trim() && !f.value.trim())
			return null;

		return f;
	}

	function ignoreRecord(gr) {
		if (gr.state < 0)
			return true;
		if (gr.sys_class_name == data.taskType && gr.state == "1")
			return true;
		if (gr.sys_class_name.indexOf(data.caseType) > -1 && gr.state == "1")
			return true;
		return false;
	}
	
	function createStateMap() {
		var caseType = data.caseType;
		var taskType = data.taskType;
		var request = data.scType;
		var requestedItem = data.scReqType;
		var stateMap = {};
		stateMap[data.caseType] ='state';
		stateMap[data.taskType] = 'state';
		stateMap[data.scType]='request_state';
		stateMap[data.scReqType]='stage';
		return stateMap;
	}
	
	function createStateIconMap() {
		var halfCircle = 'fa fa-2x fa-fw fa-adjust state-wip';
		var solidCircle = 'fa fa-2x fa-fw fa-adjust fa-circle state-awaitingAcceptance';
		var checkCircle = 'fa fa-2x fa-fw fa-check-circle state-closed';
		var banCircle = 'fa fa-2x fa-fw fa-ban state-cancelled';
		var openCircle = 'fa fa-2x fa-fw fa-circle-o state-open';
		var iconMap = {};
		
		//Task state mapping
		var taskStates = {2:halfCircle, 18:halfCircle, 20:solidCircle, 3:checkCircle, 4:banCircle, 7:banCircle, 9:banCircle, 'default':openCircle};
		iconMap[data.caseType] = taskStates;
		iconMap[data.taskType] = taskStates;
		
		//sc_request request state mapping
		var requestStates = {'in_process':halfCircle, 'closed_complete':checkCircle, 'closed_imcomplete':banCircle, 'closed_cancelled':banCircle, 'closed_rejected':banCircle, 'default':openCircle};
		iconMap[data.scType] =  requestStates;
		
		//sc_req_item stage mapping
		var requestedItemStages = {'complete':checkCircle, 'Request Cancelled':banCircle, 'waiting_for_approval':openCircle, 'default':halfCircle};
		iconMap[data.scReqType] = requestedItemStages;
		
		return iconMap;
	}
})();
