answer = gs.hasRole("taxonomy_admin") || (gs.hasRole("user_criteria_admin") && new global.TaxonomyUtil().isTaxonomyManager());
