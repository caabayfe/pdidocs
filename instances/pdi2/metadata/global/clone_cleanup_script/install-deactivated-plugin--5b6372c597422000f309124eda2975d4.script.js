var separationExceptionFieldProperty = gs.getProperty("glide.db.separation.exception.field");
var separationFieldProperty = gs.getProperty("glide.db.separation.field");
 
if(separationExceptionFieldProperty  || separationFieldProperty){
    var pm = new GlidePluginManager();
     pm.registerPlugin("com.glide.separation");
}
