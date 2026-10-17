function genChangePlanURL() {
  var number = new String(current.number);
  return "http://twiki.mycompany.com/bin/view/Folder/ChangePlan" + number.substring(3);
}
