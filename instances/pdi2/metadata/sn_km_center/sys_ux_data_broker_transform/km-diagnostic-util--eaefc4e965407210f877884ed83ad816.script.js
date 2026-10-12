function transform(params) {
    
	var userSysId = params.user_sys_id;
    var isArticle = params.record_type == "one";
    var recordSysId = isArticle ? params.article_sys_id : params.knowledge_base_sys_id;

    var diagnose = new global.KBDiagnostics(isArticle, userSysId, recordSysId);
    var finalResults = diagnose.getDiagnostics();

	if(finalResults.note){
		finalResults.note = addStyleToLink(finalResults.note);
	}

    var links = {};
    var userGr = getUserRecord(params.user_sys_id);
    var recordGr = getRecord(isArticle, params);

    links.username = diagnose.checkPropertyAndEscapeHtml(userGr.getDisplayValue('name'));

    if (isArticle) {
        var articleLinks = buildArticleLinks(recordGr, diagnose);
        links.knowledegeBase = articleLinks.kbLink;
        links.article = articleLinks.articleLink;
    } else {
        links.knowledegeBase = buildKnowledgeBaseLink(recordGr, diagnose);
    }

    finalResults.links = links;
    return finalResults;

    function getUserRecord(userSysId) {
        var userGlideRecord = new GlideRecordSecure('sys_user');
        userGlideRecord.get(userSysId);
        return userGlideRecord;
    }

    function getRecord(isArticle, params) {
        var glideRecord;
        if (isArticle) {
            glideRecord = new GlideRecordSecure('kb_knowledge');
            glideRecord.get(params.article_sys_id);
        } else {
            glideRecord = new GlideRecordSecure('kb_knowledge_base');
            glideRecord.get(params.knowledge_base_sys_id);
        }
        return glideRecord;
    }

    function buildKnowledgeBaseLink(recordGr, diagnose) {
        return {
            table: 'kb_knowledge_base',
            sysId: recordGr.getUniqueValue(),
            message: diagnose.checkPropertyAndEscapeHtml(recordGr.getDisplayValue('title'))
        };
    }

    function buildArticleLinks(articleGr, diagnose) {
        var kbKnowledge = new global.KBKnowledge();
        var recordTitle = kbKnowledge.isVersioningEnabled()
            ? articleGr.getDisplayValue('display_number')
            : articleGr.getDisplayValue('number');

        var kbId = articleGr.getValue('kb_knowledge_base');
        var kbGr = new GlideRecordSecure('kb_knowledge_base');
        kbGr.get(kbId);

        var kbLink = {
            table: 'kb_knowledge_base',
            sysId: kbId,
            message: diagnose.checkPropertyAndEscapeHtml(kbGr.getDisplayValue('title'))
        };

        var articleLink = {
            table: 'kb_knowledge',
            sysId: articleGr.getUniqueValue(),
            message: recordTitle
        };

        return { kbLink, articleLink };
    }
	function addStyleToLink( link){
		let styleStr = "style=\"color: RGB(var(--now-text-link--primary--color, var(--now-actionable_link_label--primary--color, var(--now-color--link-2))));\" ";
		let outputStr = link.replace(/<a([^>]*?)href=/g, `<a$1${styleStr}href=`);
		return outputStr;	
	}
   
}
