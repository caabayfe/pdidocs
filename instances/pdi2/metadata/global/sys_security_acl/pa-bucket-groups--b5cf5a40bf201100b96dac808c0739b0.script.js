function canDeleteBucket () {
	var relatedSources = new GlideRecord('pa_dimensions');
	relatedSources.addQuery('conditions', 'CONTAINS', current.sys_id);
	relatedSources.query();

	return !relatedSources.hasNext() && new SNC.PADomainUtils().isWriteable("pa_bucket_groups", current.sys_id);;
}

answer = canDeleteBucket();
