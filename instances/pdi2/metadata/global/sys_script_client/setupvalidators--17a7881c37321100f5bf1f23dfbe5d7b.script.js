function onLoad() {
	var validator = makeUniqueNameValidator();
	var fld = g_form.getControl(validator.field);
	fld.setAttribute('specialtype', fld.id);
	fld.validator = validator;
	g_form.addValidator(fld.id, validator.validate);
}

function lookupName(name) {
	var validator = this;
	var ga = new GlideAjax('WorkflowVersionUtils');
	ga.addParam('sysparm_name', 'isWorkflowNameUnique');
    ga.addParam('sysparm_workflow_name', name);
	ga.getXML(processResponse);
	function processResponse(response) {
		var answer = response.responseXML.documentElement.getAttribute('answer');
		validator.updateField(answer == 'true');
	}
}

//this creates a GlideValidator-like object that we can add to the g_form's validator, and also use it for the onChange
function makeUniqueNameValidator() {
	var validator = {
		field: 'name',
		message: 'A workflow with this name already exists',
		isValid: true,
		testFn: lookupName
	};
	
	//implement the GlideValidator interface so that we can integrate with g_form
	validator.validate = function(value) {
		//value is really irrelevant, we've already checked it during the onChange
		//instead, let's just see if our field has an attribute valid=false
		if (!validator.isValid) {
			return validator.message;
		} else {
			return true;
		}
	};		
	
	validator.check = function(oldValue, newValue) {
		if (newValue==oldValue) {
			validator.updateField(true);
		} else { 
			validator.testFn.call(validator,newValue);
		}
	};
	
	validator.updateField = function(isValid) {
		validator.isValid=isValid;
		if (isValid) {
			g_form.hideErrorBox(validator.field);
		} else {
			g_form.showErrorBox(validator.field, validator.message);
		}
	};
	
	return validator;
}
