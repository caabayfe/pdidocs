gs.info('CMDB LCC fix script: Checking for non-maint roles in Life Cycle Control ACLs');

//OOB ACL records provided for life_cycle_control table: sys id's
var lccWriteAcl = '7d174615b7620010ee0d3177ee11a963';
var lccReadAcl = 'e8f6c215b7620010ee0d3177ee11a9a6';
var lccCreateAcl = '17544a91b7620010ee0d3177ee11a9a2';
//Delete ACL record skipped as it has the "answer = false" script in place

var idArr = [lccWriteAcl, lccReadAcl, lccCreateAcl];

var gr = new GlideRecord('sys_security_acl_role');
gr.addQuery('sys_security_acl','IN',idArr.toString());
gr.addQuery('sys_user_role.name','CONTAINS','snc_internal');
gr.query();

if(gr.getRowCount() > 0){
	gs.info('CMDB LCC fix-script: {0} records identified in sys_security_acl_role for removal', gr.getRowCount());
    gr.deleteMultiple();
}
