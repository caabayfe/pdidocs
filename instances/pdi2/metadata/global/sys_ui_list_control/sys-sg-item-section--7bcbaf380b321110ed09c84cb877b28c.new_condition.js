var grSecCardInstance = new GlideRecord("sys_sg_section_card_instance");
grSecCardInstance.addQuery("section", current.section);	
grSecCardInstance.query();
if (grSecCardInstance.hasNext())
	true;
