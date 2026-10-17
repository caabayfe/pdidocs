//Order of this business rule is important
//It has to run after the validate default domain rule is run
function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
   GlideCacheManager.remove("default_domain", "default_domain");
   var defaultDomain = new GlideRecord('domain');
   defaultDomain.addQuery('default', 'true');
   defaultDomain.query();
	if(!defaultDomain.hasNext()) {
      return;
	}

   defaultDomain.next();
   GlideCacheManager.put("default_domain", "default_domain", defaultDomain.sys_id);
}
