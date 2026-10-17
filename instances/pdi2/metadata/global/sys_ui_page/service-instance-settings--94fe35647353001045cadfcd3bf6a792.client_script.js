var NAME = getMessage('name');
var NUMBER = getMessage('number');

var csdmHardCodedBasicArr = ['environment',
						'version',
						'model_id',
						'operational_status',
						'support_group',
						'assignment_group',
						'managed_by_group',
						'owned_by'];

var csdmHardCodedRelationshipArr = ['business_application',
						'technical_service_offering',
						'business_service_offering',
						'parent_app_service'];

// Labels for name object
var nameToLabelObj =   {model_id: getMessage('model ID'),
						operational_status: getMessage('operational status'),
						support_group: getMessage('support group'),
						assignment_group: getMessage('change group'),
						approval_group: getMessage('approval group'),
						managed_by_group: getMessage('managed by group'),
						owned_by: getMessage('owned by'),
						business_application: getMessage('business application'),
						technical_service_offering: getMessage('technical service offering'),
						business_service_offering: getMessage('business service offering'),
						parent_app_service: getMessage('parent application service')};

var csdmPropertyBasicMandatoryStr = document.getElementById('sysPropertyBasicMandatory').value;
var csdmPropertyBasicMandatoryArr = (csdmPropertyBasicMandatoryStr === '') ? [] : csdmPropertyBasicMandatoryStr.split(',');
var csdmAvailableBasicArr = diff(csdmHardCodedBasicArr, csdmPropertyBasicMandatoryArr);

var csdmPropertyRelationshipMandatoryStr = document.getElementById('sysPropertyRelationshipMandatory').value;
var csdmPropertyRelationshipMandatoryArr = (csdmPropertyRelationshipMandatoryStr === '') ? [] : csdmPropertyRelationshipMandatoryStr.split(',');
var csdmAvailableRelationshipArr = diff(csdmHardCodedRelationshipArr, csdmPropertyRelationshipMandatoryArr);

// Load mandatory "name" and "number" field into array
csdmPropertyBasicMandatoryArr.unshift(NAME);
csdmPropertyBasicMandatoryArr.unshift(NUMBER);

// Overwrite native moveUp event in order to catch and disable "name" option
SlushBucket.prototype.moveUp = function() {
	sourceSelect = this.getRightSelect(); 
	var selectedIds = this.getSelected(sourceSelect); 
	var options = sourceSelect.options;

	for (var i = 0; i < selectedIds.length; i++) {
		var selId = selectedIds[i];
		if (selId == 0) 
			break;
		if (window['privateMoveUp'])
			privateMoveUp(options, selId); 
		else
			this.swap(options[selId], options[selId - 1]);
		
		options[selId].selected = false;
		options[selId - 1].selected = true;
		
		// If is "name" or "number" keep correct option disabled
		if (options[selId].value === NAME || options[selId].value === NUMBER) { 
			options[selId].disabled = true;
			options[selId - 1].disabled = false;
		}
	} 

	this.evenOddColorize(); 
	sourceSelect.focus(); 
	
	if (sourceSelect["onLocalMoveUp"])
		sourceSelect.onLocalMoveUp(); 
};

// Overwrite native moveDown event in order to catch and disable "name" option
SlushBucket.prototype.moveDown = function() { 
	var sourceSelect = this.getRightSelect();
	var selectedIds = this.getSelected(sourceSelect);
	
	selectedIds.reverse();
	var options = sourceSelect.options;
	
	for (var i = 0; i < selectedIds.length; i++) { 
		var selId = selectedIds[i];
		
		if (selId + 1 == options.length) 
			break;
		
		if (window['privateMoveDown'])
			privateMoveDown(options, selId);
		else
			this.swap(options[selId], options[selId + 1]);
		
		options[selId].selected = false;
		options[selId + 1].selected = true;
		
		// If is "name" or "number" keep correct option disabled
		if (options[selId].value === NAME  || options[selId].value === NUMBER) {
			options[selId].disabled = true;
			options[selId + 1].disabled = false;
		}
	}
	
	this.evenOddColorize();
	sourceSelect.focus();
	
	if (sourceSelect["onLocalMoveDown"]) 
		sourceSelect.onLocalMoveDown();
};

var slushBasic = new SlushBucket('slush_basic_csdm'); // Basic slushbucket
var selectBasicLeft = gel('slush_basic_csdm_left'); // Select left side basic slushbucket
var selectBasicRight = gel('slush_basic_csdm_right'); // Select right side basic slushbucket
var slushRelationship = new SlushBucket('slush_relationship_csdm'); // Relationship slushbucket
var selectRelationshipLeft = gel('slush_relationship_csdm_left'); // Select left side relationship slushbucket
var selectRelationshipRight = gel('slush_relationship_csdm_right'); // Select right side relationship slushbucket
var opRight = null;
var opLeft = null;

generateRightSlushBucket();
generateLeftSlushBucket();

function generateRightSlushBucket() {
	slushBasic.clearSelect(selectBasicRight);
	for (var i = 0; i < csdmPropertyBasicMandatoryArr.length; i++) {
		opRight = new Option(createLabel(csdmPropertyBasicMandatoryArr[i]), csdmPropertyBasicMandatoryArr[i]);
		selectBasicRight.options[selectBasicRight.options.length] = opRight;
		// Disable mandatory "name" value
		if (selectBasicRight.options[i].value === NAME || selectBasicRight.options[i].value === NUMBER) {
			selectBasicRight.options[i].disabled = true;
		}
	}
	slushRelationship.clearSelect(selectRelationshipRight);
	for (var j = 0; j < csdmPropertyRelationshipMandatoryArr.length; j++) {
		opRight = new Option(createLabel(csdmPropertyRelationshipMandatoryArr[j]), csdmPropertyRelationshipMandatoryArr[j]);
		selectRelationshipRight.options[selectRelationshipRight.options.length] = opRight;
	}
}

function generateLeftSlushBucket() {
	for (var i = 0; i < csdmAvailableBasicArr.length; i++) {
		opLeft = new Option(createLabel(csdmAvailableBasicArr[i]), csdmAvailableBasicArr[i]);
		selectBasicLeft.options[selectBasicLeft.options.length] = opLeft;
	}
	for (var j = 0; j < csdmAvailableRelationshipArr.length; j++) {
		opLeft = new Option(createLabel(csdmAvailableRelationshipArr[j]), csdmAvailableRelationshipArr[j]);
		selectRelationshipLeft.options[selectRelationshipLeft.options.length] = opLeft;
	}
}

// Figure out the difference of what fields are mandatory from sys_properties
function diff(unique, mandatory) {
	return unique.filter(function(val, idx) {
		return mandatory.indexOf(val) < 0;
	});
}

// Create a label from name when possible
function createLabel(name) {
	var nameTolabel = (nameToLabelObj[name]) ? nameToLabelObj[name] : name;
	return nameTolabel;
}

// Event onCancel go back to original state
function onCancel() {
	return true;
}

// Event, onSave get selected array from slushbucket, remove 'name' and prep to pass to processing script
function onSave() {
	var selectedBasicArr = slushBasic.getValues(selectBasicRight);
	var selectedRelationshipArr = slushRelationship.getValues(selectRelationshipRight);
	var filteredSelectedArr = selectedBasicArr.filter(function(str) {
		return str !== NAME && str !== NUMBER;
	});
	var selectedBasicStr = filteredSelectedArr.toString();
	document.getElementById('sysPropertyBasicMandatory').value = selectedBasicStr;
	document.getElementById('sysPropertyRelationshipMandatory').value = selectedRelationshipArr.toString();
}
