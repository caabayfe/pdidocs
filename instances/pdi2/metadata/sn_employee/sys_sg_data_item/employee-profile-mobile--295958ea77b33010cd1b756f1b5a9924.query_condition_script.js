(function getQueryString(input) {
//Type appropriate comment here, and begin script below
var currentUser = input.manual_user || input.logged_in_user;
var queryString = 'sysuser_sys_idIN' + currentUser;
return queryString; 
})(input);
