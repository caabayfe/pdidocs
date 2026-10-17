// complete (set processed) synchronous import sets so that a new one
// will be created.  By default, a new synchronous
// import set will be created daily at midnight
setIsetProcessed();

function setIsetProcessed() {
var igr = new GlideRecord("sys_import_set");
igr.addQuery("mode", "synchronous");
igr.addQuery("state", "loading");
igr.query();
  while(igr.next()) {
  
    igr.state = "processed";
    igr.update();
  }
}
