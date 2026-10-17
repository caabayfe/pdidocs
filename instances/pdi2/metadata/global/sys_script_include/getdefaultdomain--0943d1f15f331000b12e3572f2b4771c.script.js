function getDefaultDomain() {
   var s = gs.getProperty("glide.domain.default");
   if (s != null && s != "" && s != "global")
      return s;
   
   var domID = "global";
   var dom = new GlideRecord("domain");
   dom.addQuery("default", true);
   dom.query();
   if (dom.next())
      domID = dom.getUniqueValue();

   GlideProperties.set("glide.domain.default", domID);
   return domID;
}
