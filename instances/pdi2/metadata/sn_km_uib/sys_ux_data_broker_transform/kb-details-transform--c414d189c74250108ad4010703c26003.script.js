function transform(input) {
	var data = input.graphqlData.data.AppKnowledge_Query.getArticleDetails;

	/*
	Control various feature/functionality on article view  page on the base of page level and global properties. If page level properties are not defined for a given workspace/experience, then it will be controlled by global properties. If defined for a given workspace, then both page level and global properties will be honored by performing 'and' operation between two.
	*/

	data.showStarRating = global.JSUtil.nil(input.showRating) ? data.showStarRating  : data.showStarRating && input.showRating;
	data.showYNRating = global.JSUtil.nil(input.showHelpful) ? data.showYNRating  : data.showYNRating && input.showHelpful;
	data.showFlag = global.JSUtil.nil(input.showFlag) ? data.showFlag  : data.showFlag && input.showFlag;
	data.showFeedbackComments = global.JSUtil.nil(input.showComments) ? data.showFeedbackComments  : data.showFeedbackComments && input.showComments;
	data.showRelatedArticles = global.JSUtil.nil(input.showRelatedArticles) ? true  : input.showRelatedArticles;

	var versionInfo = {};
	var selectedVersion = [];
	var versions = [];
	var versionData = data.versionDetails;
	var versionHistory = versionData.history;
	if(versionData.isInstalled && versionData.isEnabled)
		for(var i=0;i<versionHistory.length;i++){
			var version = {};
			version.id = versionHistory[i].sysId;
			version.label = versionHistory[i].versionNumber;
			version.sysClassName = versionHistory[i].sysClassName;

			versions.push(version);
		}
	versionInfo.versions=versions;
	
	var articleInfo = data.articleInfo;
	if(versions.length>0){
		versionInfo.isHiddenVersion = false;
		selectedVersion.push(data.articleSysId);
	}
	versionInfo.selectedVersion = selectedVersion;
	data.versionInfo =versionInfo;
	
	var languageInfo = {};
	var selectedLangVersion = [];
	var langVersions = [];
	var languageDetails = data.languageDetails;
	for(i=0;i<languageDetails.length;i++){
		var langVersion = {};
		langVersion.id = languageDetails[i].sysId;
		langVersion.label = languageDetails[i].label;
		
		langVersions.push(langVersion);
		if(languageDetails[i].selected)
			selectedLangVersion.push(languageDetails[i].sysId);
		}
	languageInfo.langVersions=langVersions;
	if(langVersions.length>0){
		languageInfo.isHiddenVersion = false;
	}
	languageInfo.selectedLangVersion = selectedLangVersion;
	data.languageInfo =languageInfo;
	
	var secondaryFields = [];
	
	var field1 = {};
	field1.type = "timeToRead";
	field1.icon = "clock-outline";
	field1.text = "";
	field1.column = "timeToRead";
	field1.screenReaderText = gs.getMessage("Article takes {0} minutes to read");
	secondaryFields.push(field1);
	
	var field2 = {};
	field2.type = "date";
	field2.icon = "calendar-outline";
	field2.text = gs.getMessage("Updated {0}");
	field2.value = articleInfo.sysUpdatedOn;
	field2.column = "sysUpdatedOn";
	secondaryFields.push(field2);
	
	if(articleInfo.sysViewCount != '-1') {
		var field3 = {};
		field3.type = "string";
		field3.icon = "eye-outline";
		field3.column = "viewCount";
		if(articleInfo.sysViewCount == 1){
			field3.text = gs.getMessage("kb_article_view_count_singular", articleInfo.sysViewCount);
			field3.screenReaderText = gs.getMessage("kb_article_view_count_singular_sr", articleInfo.sysViewCount);
		}
		else{
			field3.text = gs.getMessage("kb_article_view_count_plural", articleInfo.sysViewCount);
			field3.screenReaderText = gs.getMessage("kb_article_view_count_plural_sr", articleInfo.sysViewCount);
		}
		secondaryFields.push(field3);
	}
	
	if(data.showStarRating && articleInfo.rating != '-1') {
		var field4 = {};
		field4.type = "string";
		field4.icon = "star-outline";
		field4.column = "rating";
		field4.text = gs.getMessage("Average rating {0}/5",articleInfo.rating);
		field4.screenReaderText = gs.getMessage("Article has average rating - {0} out of 5 stars",articleInfo.rating);
		secondaryFields.push(field4);
	}
	
	data.secondaryFields = secondaryFields;
	
	if(articleInfo.displayAttachments){
		var attachments = new GlideRecordSecure('sys_attachment');
		attachments.addQuery('table_sys_id', data.articleSysId);
		attachments.addQuery('table_name', articleInfo.sysClassName);
		attachments.query();
		articleInfo.hasAttachments = attachments.next();
	}
	data.flagArticleLabel = gs.getMessage("Flag Article");
	data.copyLinkLabel = gs.getMessage("Copy Link");
	
	return data;
}
