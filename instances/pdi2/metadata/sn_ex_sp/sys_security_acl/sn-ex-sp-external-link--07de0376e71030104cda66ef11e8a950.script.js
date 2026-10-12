answer = gs.hasRole('taxonomy_admin') || gs.hasRole('sp_admin') ||  new global.TaxonomyUtil().isTaxonomyManager();
