/*
These are new ACLs to allow write access to comments on the Requested item for users with business stakeholder role. To be in consistent with the Incident, Problem and Change management experiences these ACL's would be activated only on zboot and first activation of plugin.
'plugin.activated' event is used so that only zboot and first activation instances can have new ACLs as active.
'plugin.upgraded' event should not be used.
*/
var bsCommentsWriteACLIds = [
    'e80bdebeeb3230106fb3951ff152288b',
    'da6cdefeeb3230106fb3951ff1522808'
];
var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', bsCommentsWriteACLIds);
aclGR.setValue('active', true);
aclGR.updateMultiple();
