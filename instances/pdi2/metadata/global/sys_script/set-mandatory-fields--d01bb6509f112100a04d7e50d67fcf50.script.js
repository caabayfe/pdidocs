/*
Maintain data policy for each knowledge base to enforce the mandatory fileds configuration set at the knowledge      class
 */

//Delete the data policy and related rules if class is deleted
if(current.operation() == 'delete')
	deletePolicy();
// Create new data policy and rules for each of the mandatory fields
else if(current.operation() == 'insert' || (current.mandatory_fields.changes() && current.data_policy.nil())){
	createPolicy();
	createRules(getArrayFromGlideList());
// Find the related data policy and recreate the rules assigned to it to reflect the class update	
}else if(current.mandatory_fields.changes() && !current.data_policy.nil()){
	updatePolicy();
	deleteRules();
	createRules(getArrayFromGlideList());
}

// Create array from the mandatory fields csv string
function getArrayFromGlideList(){
	return current.mandatory_fields.split(",");
}

// Create new data policy record
function createPolicy(){
	var policy = GlideRecord("sys_data_policy2");
	policy.model_table = "kb_knowledge";
	policy.conditions = "kb_knowledge_base=" + current.getUniqueValue() + "^EQ";
	policy.enforce_ui = true;
	policy.active = true;
	policy.short_description = "Data policy for " + current.title + " knowledge base";
	current.data_policy = policy.insert();
}

// Create data policy rule record for a given mandatory field
function createRules(fields){
	for (var i=0; i < fields.length; i++) {
		var policyRule = GlideRecord("sys_data_policy_rule");
		policyRule.sys_data_policy = current.data_policy;
		policyRule.table = "kb_knowledge";
		policyRule.field = fields[i];
		policyRule.mandatory = "true";
		policyRule.insert();
	}
}

// Update the related data policy record
function updatePolicy(){
	var policy = GlideRecord("sys_data_policy2");
	policy.get(current.data_policy);
	policy.short_description = "Data policy for " + current.title + " knowledge base";
	policy.update();
}

// Delete the related data policy record
function deletePolicy(){
	var policy = GlideRecord("sys_data_policy2");
	policy.get(current.data_policy);
	gs.addInfoMessage(
		gs.getMessage("Data policy '{0}' deleted.", [policy.getDisplayValue()])
	);
	policy.deleteRecord();
}

function deleteRules(){
	var rules = GlideRecord("sys_data_policy_rule");
	rules.addQuery("sys_data_policy", current.data_policy);
	rules.query();
	rules.deleteMultiple();
}
