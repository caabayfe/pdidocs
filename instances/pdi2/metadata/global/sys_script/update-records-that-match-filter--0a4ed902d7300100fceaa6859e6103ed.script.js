getDelta(current, previous);

function getDelta(current, previous) {
	var isDomainPluginActive = GlidePluginManager.isActive('com.glide.domain');
	var asmtUtils = new global.AssessmentUtils();

	// First generate new relationships, which are 'asmt_m2m_category_assessment' records.
	var currM2mCatAsble = asmtUtils.generateM2mCategoryAssessmentsIfNotExisted(current, isDomainPluginActive);
	// Remove old relationships if any
	if (current.operation() != 'insert') {
		asmtUtils.removeOldM2mCategoryAssessments(previous, currM2mCatAsble);
	}
}
