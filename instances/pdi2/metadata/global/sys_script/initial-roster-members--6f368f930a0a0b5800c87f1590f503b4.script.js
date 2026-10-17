var rosterID = current.sys_id;
var rota = new GlideRecord("cmn_rota");
rota.initialize();
rota.get(current.getValue("rota"));
var groupID = rota.getValue("group");
insertMembers(rosterID, groupID);

function insertMembers(rosterID, groupID) {
   // Put all members of the group into the roster
   var newGR = new GlideRecord("cmn_rota_member");
   var ugr = new GlideRecord("sys_user_grmember");
   ugr.initialize();
   ugr.addQuery("group", groupID);
   ugr.query();
   
   var order = 1;
   while (ugr.next()) {
      newGR.initialize();
      newGR.roster = rosterID;
      newGR.member = ugr.user;
      newGR.order = order;
      order++;
      newGR.insert();
   }
}
