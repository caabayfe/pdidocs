gs.info("Starting update of Enable OneApi");

var systemPropertyGr = new GlideRecord("sys_properties");
systemPropertyGr.addQuery("name","com.glide.cs.one.api.disabled");
systemPropertyGr.query();
if(!systemPropertyGr.next()) {
  systemPropertyGr.setValue("name","com.glide.cs.one.api.disabled");
  systemPropertyGr.setValue("value", false);
  systemPropertyGr.setValue("type", "boolean");
  systemPropertyGr.insert();
} else if (systemPropertyGr.value && systemPropertyGr.sys_updated_by == "system") {
  systemPropertyGr.setValue("value", false);
  systemPropertyGr.update();
}

gs.info("Ending update of Enable OneApi");
