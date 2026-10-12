var countGr = new GlideRecord("itom_lu_definition_usage_count");
		countGr.addQuery("name","hardware");
		countGr.query();
		answer = countGr.next() ? countGr.getValue('count') : 0;
