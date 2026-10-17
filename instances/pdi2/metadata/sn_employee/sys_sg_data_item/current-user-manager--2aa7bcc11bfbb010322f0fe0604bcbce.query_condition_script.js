(function getQueryString(input) {
  var manager = new sn_employee.EP_MyTeamsUtils().getCurrentUserManager(input);
  var queryString = 'sysuser_sys_idIN' + manager ;
 return queryString;
 })(input);
