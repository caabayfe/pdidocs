function emailsToUsers(emails) {
  var append = false;
  if (emails.substr(emails.length - 3) == "...")
    append = true;
  var usr = new GlideRecord('sys_user');
  var answer = "";
  var newval = "";
  var s = "";
  var arr = emails.split(',');
  for (var i = 0; i < arr.length; i++) {
    s = GlideStringUtil.stripSuffix(arr[i].trim(),"...");
    usr.initialize();
    if (usr.get(GlideUser.getSysId('email',s)))
      newval = usr.getDisplayValue();
    else 
      newval = s;

    if (answer == "")
      answer = newval
    else
      answer = answer + ", " + newval;
  }
  if (append == true)
    answer = answer + "...";
  return answer;
}
