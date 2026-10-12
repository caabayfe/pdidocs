var gr = new GlideRecord("sc_ic_item_staging");
if (gr.get(current.table_sys_id))
	sc_ic_Factory.wrap(gr).setDraftForImage();
