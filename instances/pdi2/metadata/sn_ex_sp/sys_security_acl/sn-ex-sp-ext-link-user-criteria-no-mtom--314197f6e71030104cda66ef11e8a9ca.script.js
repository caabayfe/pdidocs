answer = current.user_criteria.getRefRecord().canWrite() && (new global.TaxonomyUtil().isTaxonomyManager() || gs.hasRole('taxonomy_admin') || gs.hasRole('sp_admin'));
