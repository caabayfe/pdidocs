//
// Return an array of all the users that are in any of the groups specified
//
function getGroupMembers(name1, name2, name3, name4, name5) {
   var answer = new Array();
   getGroupMembersGivenGroupName(name1, answer);
   getGroupMembersGivenGroupName(name2, answer);
   getGroupMembersGivenGroupName(name3, answer);
   getGroupMembersGivenGroupName(name4, answer);
   getGroupMembersGivenGroupName(name5, answer);
   return answer;
}

// 
// Add members of a specified group into an array
//
function getGroupMembersGivenGroupName(name, answer) {
   var i = answer.length;
   if (name == null || name == '')
      return;

   var group = new GlideRecord('sys_user_group');
   group.addQuery('name', name);
   group.query();
   if (group.next()) {
      var groupID = group.sys_id;
      getGroupMembersGivenGroupID(groupID, answer);   
   }
   return answer;
}

// 
// Add members of a specified group into an array
//
function getGroupMembersGivenGroupID(groupID, answer) {
   var i = answer.length;            
   var members = new GlideRecord('sys_user_grmember');
   members.addQuery('group', groupID);
   members.query();      
   while (members.next()) {
      answer[i++] = new String(members.user);   
   }
   return answer;
}

//
// Get an array of all users that belong to the same groups
// that the current user belongs to
//
function getAllMembersOfMyGroups() {
  var u = gs.getUserID();
  var g = new GlideRecord("sys_user_grmember"); 
  g.addQuery("user", u); 
  g.query(); 
  var answer = new Array();
  var i = 0;
  while( g.next()) {
    getGroupMembersGivenGroupID(g.group, answer);  
  }
  return answer;

}
