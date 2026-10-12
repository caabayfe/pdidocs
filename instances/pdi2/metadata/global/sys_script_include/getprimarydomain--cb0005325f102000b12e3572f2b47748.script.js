function getPrimaryDomain() {
   var s = gs.getProperty("glide.domain.primary");
   if (s != null && s != "" && s != "global")
      return s;
   
   var domID = "global";
   var dom = new GlideRecord("domain");
   if (dom.get("primary", true))
      domID = dom.getUniqueValue();

   GlideProperties.set("glide.domain.primary", domID);
   return domID;
}
