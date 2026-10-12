new AisConfigurationUtil().indexTableNoBlock(current.source);
var grDsStats = new GlideRecord("ais_ingest_datasource_stats");
grDsStats.addQuery("datasource", current.source);
grDsStats.orderByDesc('sys_created_on');
grDsStats.query();  //Should only be one record here
if(grDsStats.next()){
	action.setRedirectURL(grDsStats);
}
gs.addInfoMessage(gs.getMessage("Index event created"));
