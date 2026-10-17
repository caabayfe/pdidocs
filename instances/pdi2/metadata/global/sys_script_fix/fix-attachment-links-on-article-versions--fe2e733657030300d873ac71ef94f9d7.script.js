//We want to replace Sys Ids of attachment of any previous version of article
//with the Sys Ids of correspond ing attachment of current article.

//For example, We have 3 versions of article with images.
//Version 1 - Outdated, It has an image attachment with sysids (ABC),
//Version 2 - Outdated, It has two image attachments with sysids (DEF, GHI). Attachment DEF is created by copying ABC from Version 1
//            when Version 1 is checked out to create version 1.01 and consequently published becoming 2.0
//Version 3 - Published, It has three image attachments (JKL, MNO, PQR). DEF became JKL and GHI became MNO, PQR is a new attachment.

//Images with src="sys_attachment.do?sys_id=ABC" stays as it is in version 1 but in version 2 it will
//become src="sys_attachment.do?sys_id=DEF" and the in version 3 should become src="sys_attachment.do?sys_id=JKL".
//Similarly images with src="sys_attachment.do?sys_id=GHI" stays as it is in version 2 but in version 3 it will
//become src="sys_attachment.do?sys_id=MNO"

//No need to worry about articles with just one version

//1) Get article with more than one version - count(article_id) > 1
//2) For each article_id, Get all the versions
//3) For each article_id, fetch attachment records of all versions
//4) For each attachment find out corresponding attachment in the current article version
//5) Now update the versions with attachment mapping.



fixAttachments();

/**
 * Get article with more than one version - count(article_id) > 1
 */
function getArticlesIds() {
	var articles = new GlideAggregate('kb_knowledge');
	articles.addNotNullQuery('article_id');
	articles.addAggregate('COUNT', 'article_id');
	articles.groupBy('article_id');
	articles.addHaving('COUNT', '>', 1);
	articles.query();
	
	return articles;
}

/**
 * Get all the versions of a given articleId in the order they are created.
 */
function getArticleVersions(articleId) {
	//Query for all the versions of the article
	var article = new GlideRecord('kb_knowledge');
	article.addQuery('article_id', articleId);
	article.orderBy('sys_created_on');
	article.query();
	var versions = [];
	var tableName;
	
	//Loop over the versions and collect the details
	while (article.next()) {
		versions[article.sys_id + ''] = {
			"map": []
		};
		if (!tableName)
			tableName = article.sys_class_name + '';
	}
	
	return {
		"versions": versions,
		"tableName": tableName
	};
}

/**
 * For the given SysId of article versions and the tableName, returns
 * copied attachment sysid of a previous version's attachment for each
 * version
 */
function processAttachments(sysIds, versions, tableName) {
	
	//Query for all the attachments of all the versions
	//order by created
	var attach = new GlideRecord('sys_attachment');
	attach.addQuery('table_name', tableName);
	attach.addQuery('table_sys_id', 'IN', sysIds.join());
	attach.orderBy('sys_created_on');
	attach.query();
	
	var prevTableSysId = 'prevTableSysId'; //Dummy value
	var curTableSysId = 'curTableSysId'; //Dummy value
	
	var prevAttachments = [];
	var prevAttachmentDetails = [];
	
	var curAttachments = [];
	var curAttachDetails = [];
	var curAttachIds = null;
	var mappedSysIds = null;
	var mapFunc = function(key) {return curAttachments[key];};
		
	while (attach.next()) {
		curTableSysId = attach.table_sys_id + '';
		if (prevTableSysId != curTableSysId) {
			//Attachments of a newer version than what is processed till now
			//Map previous attachments sys_id to new attachment sys_ids using file_name, size_bytes,,] content_type.
			curAttachIds = Object.keys(curAttachments);
			if (curAttachIds && curAttachIds.length > 0) {
				curAttachDetails = curAttachIds.map(mapFunc);
				if (prevAttachments.length > 0) {
					mappedSysIds = mapPreviousAttachmentToCurrent(curAttachments, curAttachDetails, prevAttachments, prevAttachmentDetails);
					versions[prevTableSysId].map = mappedSysIds;
				}
				//Copy current attachment ids and details to previous attachment array
				prevAttachments = prevAttachments.concat(curAttachIds.slice(0)); //Using slice so it does deep copy.
				prevAttachmentDetails = prevAttachmentDetails.concat(curAttachDetails.slice(0));
			}
			curAttachments = [];
			curAttachDetails = [];
			prevTableSysId = curTableSysId + '';
		}
		curAttachments[attach.sys_id + ''] = attach.file_name + attach.size_bytes + attach.content_type;
	}
	//Do the processing once again for the last version
	curAttachIds = Object.keys(curAttachments);
	if (curAttachIds && curAttachIds.length > 0) {
		curAttachDetails = curAttachIds.map(mapFunc);
		if (prevAttachments.length > 0) {
			mappedSysIds = mapPreviousAttachmentToCurrent(curAttachments, curAttachDetails, prevAttachments, prevAttachmentDetails);
			versions[prevTableSysId].map = mappedSysIds;
		}
		//Copy current attachment ids and details to previous attachment array
		prevAttachments = prevAttachments.concat(Object.keys(curAttachments).slice(0)); //Using slice so it does deep copy.
		prevAttachmentDetails = prevAttachmentDetails.concat(Object.values(curAttachments).slice(0));
	}

	return versions;

}

/**
 * Based on the details of a previous attachment (file_name, size_bytes, content_type),
 * it is mapped to a current attachment with same details.
 */
function mapPreviousAttachmentToCurrent(curAttachments, curAttachDetails, prevAttachments, prevAttachmentDetails) {
	var mappedSysIds = [];
	var curAttachIds = Object.keys(curAttachments);
	if (curAttachIds && curAttachIds.length > 0) {
		for (var pi = 0; pi < prevAttachments.length; pi++) {
			var sysId = prevAttachments[pi];
			var details = prevAttachmentDetails[pi];
			var idx = curAttachDetails.indexOf(details);
			if (idx > -1) {
				var newSysId = curAttachIds[idx];
				mappedSysIds[sysId + ''] = newSysId + '';
			}
		}
	}
	return mappedSysIds;
}

/**
 * Main function that orchestrates the updating attachment sysids of attachment
 * links to previous versions attachment
 */
function fixAttachments() {
	gs.log('Fix Attachment Links - Start', 'FIX_ATTACHMENT_LINKS');
	var articles = getArticlesIds();
	var versioning = new global.KBVersioning();

	while (articles.next()) {
		gs.log('Fixing Attachment Links for Article (Article Id) = ' + articles.article_id, 'FIX_ATTACHMENT_LINKS');

		var articleVersions = getArticleVersions(articles.article_id + '');

		//We now have all the versions of an article in the older to latest order.
		//Lets loop over the attachments of all the versions and construct the
		//attachment details and map it
		var versions = articleVersions.versions;
		var sysIds = Object.keys(versions);
		if (sysIds) {
			processAttachments(sysIds, versions, articleVersions.tableName);

			//Now update the attachment sys id in every field of article
			var templateFieldCache = [];
			for (var i = 0; i < sysIds.length; i++) {
				var artSysId = sysIds[i];
				var artDetail = versions[artSysId];
				var attachMap = artDetail.map;
				if (!gs.nil(attachMap)) {
					var oldSysIds = Object.keys(attachMap);
					if (oldSysIds && oldSysIds.length > 0) {
						var article = new GlideRecord(articleVersions.tableName);
						article.setWorkflow(false);
						article.autoSysFields(false);
						if (article.get(artSysId)) {
							gs.log('Processing article ' + article.number + ' - ' + article.version.version + ' - ' + article.workflow_state, 'FIX_ATTACHMENT_LINKS');
							var fields = templateFieldCache[article.sys_class_name];
							if (!fields || gs.nil(fields)) {
								fields = versioning.getArticleFields(article);
								templateFieldCache[article.sys_class_name + ''] = fields;
							}
							var updated = false;
							for (var j = 0; j < fields.length; j++) {
								var fieldName = fields[j];
								var updatedField = false;
								if (!gs.nil(article[fieldName])) {
									var fieldValue = article[fieldName].toString();
									for (var k = 0; k < oldSysIds.length; k++) {
										var oldSysId = oldSysIds[k];
										if (!gs.nil(oldSysId) && !gs.nil(attachMap[oldSysId]) && fieldValue.indexOf(oldSysId) > -1) {
											var newSysId = attachMap[oldSysId];
											gs.log('Updating: (' + fieldName + ') ' + oldSysId + ' -> ' + newSysId, 'FIX_ATTACHMENT_LINKS');
											fieldValue = fieldValue.replaceAll(oldSysId, newSysId);
											updatedField = true;
										}
									}
									if(updatedField) {
										article[fieldName] = fieldValue;
										updated = true;
									}
								}
							}
							if (updated) {
								gs.log('Saving changes to article ' + article.article_id, 'FIX_ATTACHMENT_LINKS');
								article.update();
							}
							else {
								gs.log('Article not updated - SysId=' + article.sys_id, 'FIX_ATTACHMENT_LINKS');
							}
						}
					}
				}
			}
		}
	}
}
