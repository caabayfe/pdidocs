var answer;
//Do not omit edit button if user is authorized based on roles and owned_by/delegate.
var userHasAccess  = (new global.SPMUtilsFactory().getUtils()).checkServiceAuthorization(parent);

if (userHasAccess) {
	answer = false;
} else {
	answer = true;
}
answer;
