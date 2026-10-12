// no_flush global is set when updating a properties page, cache is already flushed there
if (typeof no_flush == "undefined") {
   if (current.getValue("ignore_cache") != true) 
      gs.cacheFlush();
   
   GlidePropertiesDB.invalidate();
   
   if (current.operation() == 'delete')
      GlidePropertiesDB.remove(current);
}
