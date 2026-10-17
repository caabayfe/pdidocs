answer = gs.hasRole('taxonomy_admin') || gs.hasRole('sp_admin') ||  new global.TaxonomyUtil().isTaxonomyManager() || new sn_ex_sp.TopicSecurityUtil().isTopicAdmin();
if(!current.isNewRecord()) {
	answer = answer || new sn_ex_sp.QuickLinkUtil().canRead(current);
}
