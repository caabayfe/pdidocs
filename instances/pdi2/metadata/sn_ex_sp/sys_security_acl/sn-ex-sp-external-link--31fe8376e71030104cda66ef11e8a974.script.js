answer = gs.hasRole('taxonomy_admin') || gs.hasRole('sp_admin') ||  new global.TaxonomyUtil().isTaxonomyManager();
if(!current.isNewRecord()){
	answer = answer  || new sn_ex_sp.ExternalLinkUtil().canRead(current.sys_id);
}
