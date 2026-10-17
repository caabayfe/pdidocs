(function () {
	if (pm.isZboot())
		return;

	SNC.DictionaryAttribute.set('ngbsm_related_item', 'configuration_item', 'allow_public', 'true');
	SNC.DictionaryAttribute.set('ngbsm_related_item', 'related_item', 'allow_public', 'true');
	gs.info("Set 'allow_public' to true for table 'ngbsm_related_item' columns");
})();
