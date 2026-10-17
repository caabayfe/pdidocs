var contract = new GlideRecord("ast_contract");
contract.get(current.ast_contract);
current.contract_type = contract.sys_class_name.getDisplayValue();
var ci = new GlideRecord("cmdb_ci");
ci.get(current.ci_item);
current.ci_type = ci.sys_class_name.getDisplayValue();
