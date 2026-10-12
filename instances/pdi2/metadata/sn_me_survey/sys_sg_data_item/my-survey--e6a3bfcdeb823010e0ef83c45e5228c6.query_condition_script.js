(function getQueryString(input) {
    var surveys = new global.AssessmentUtils().getMyFilteredSurveys();
  var queryString = 'sys_idIN' + surveys +'^EQ^ORDERBYdue_date';
 return queryString;
 })(input);
