(function executeRule(current, previous /*null when async*/) {
	
	g_scratchpad.enable_translation_task = gs.getProperty('glide.knowman.translation.enable_translation_task','false');
	g_scratchpad.isOwnershipEnabled = gs.getProperty("glide.knowman.ownership_group.enabled",false)+"";
	g_scratchpad.isArticleTemplate = new KBViewModel().isArticleTemplate(current.getValue('sys_class_name'));
	//used in the Default FAQ article template message 
	g_scratchpad.articleTemplate = current.getValue('sys_class_name');
	g_scratchpad.versioning = {};
	var versioning = new KBVersioning();
	g_scratchpad.versioning.enabled = versioning.isVersioningEnabled();
	g_scratchpad.versioning.message = versioning.getWarningMessage(current, current.getTableName()+".do?sys_id=");
	
	try {
		if(RP && RP.getParameterValue('UploadNewVersion'))
			gs.addInfoMessage(gs.getMessage("Article revision successfully created from uploaded file."));
	} catch(e) {}
	
	if(g_scratchpad.enable_translation_task == 'true' && g_scratchpad.versioning.enabled){
		g_scratchpad.articleversion = current.version.version; 
		g_scratchpad.languageList = new KBPortalServiceImpl().getAvailableLanguages(current.language);
		g_scratchpad.canChangeKnowledgeBase = !(new KBTranslationTask().hasAttachedTranslationTask(current)) && !(new KBTranslation().hasTranslatedVersion(current));
	}
	
	if (pm.isActive('com.snc.knowledge_blocks')) {
         var kbBlock = new KBBlock();
         g_scratchpad.isArticleContainsBlocks = kbBlock.hasBlocks(current);
         g_scratchpad.isBlockAttachedToArticle = current.getTableName() == 'kb_knowledge_block' && kbBlock.hasArticles(current.number);
    }
	
	if(current.workflow_state=='published' && g_scratchpad.versioning.enabled)
		g_scratchpad.versioning.editableFieldsMap = buildMap(versioning.getEditableFields());

	function buildMap(listString){
		var map = {};
			if(listString){
				var list = listString.split(',');
				for(var i=0;i<list.length;i++){
					map[list[i]] = true;
				}
			}
			return map;
		}
	})(current, previous);
