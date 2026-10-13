function onAfter(current, previous) {
   
  //gs.print("group member changed");
  var bsManager = new SNC.BusinessServiceManager();
  bsManager.dashboardStructureHadChange(); 
}
