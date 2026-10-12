setInheritedFields(current);
if(current.source_table == '' || current.source_id == '') {
    if (current.task != '') {
        current.source_table = current.task.sys_class_name;
        current.source_id = current.task;
    } else if (current.ci != '') {
        current.source_table = current.ci.sys_class_name;
        current.source_id = current.ci;
    } else if (current.asset != '') {
        current.source_table = current.asset.sys_class_name;
        current.source_id = current.asset;
		current.fixed_asset = (new ExpenseManagementUtils()).fetchFixedAssset(current.asset);
    } else if (current.user != '') {
        current.source_table = 'sys_user';
        current.source_id = current.user;
    } else if (current.contract != '') {
        current.source_table = current.contract.sys_class_name ;
        current.source_id = current.contract;
    } else if(!gs.nil(current.investment)) {
      var investment = current.investment.getRefRecord();
      current.source_table = investment.funding_entity_table;
      current.source_id = investment.funding_entity_id;
  }
}

if (current.source_id != '' && current.source_table != '') {
	var values = (new ExpenseManagementUtils()).fetchValues(current.source_id, current.source_table, current);
	for(var field in values) {
		if(values[field]) {
			current[field] = values[field];
		}
	}
}

function setInheritedFields(current) {
	if(!current.inherited || current.parent == '')
		return;
	
	var fields = ['task', 'ci', 'asset', 'user', 'contract'];
	for(var i = 0; i < fields.length; ++i) {
		if(current[fields[i]] == '')
			current[fields[i]] = current.parent[fields[i]];
	}
}
