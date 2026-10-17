var ArticleTemplateUtilSNC = Class.create();
ArticleTemplateUtilSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	validateTableName : function(tableName){
		if(tableName){
			var gr = new GlideRecord('sys_db_object');
			gr.addQuery('name', tableName);
			gr.query();
			return gr.next();
		}
		return false;
	},
	
	validateATNameWithParams : function(atName, tableName){
		if(atName){
			var gr = new GlideRecord('kb_article_template');
			gr.addQuery('article_template', atName);
			gr.query();
			if(gr.next() || this.validateTableName(tableName))
				return 'nameExists';
		}
		return '';
		
	},
	validateATName : function(){
		var atParam = this.getParameter('article_template') + '';
		var tableName = this.getNameFromLabel(atParam, 'kb_template_', true);
		if(tableName == '')
			return 'invalidName';
		return this.validateATNameWithParams(atParam, tableName);
	},
	
	validateColumnNameWithParams : function(colName, tableName, columnLabel, articleTemplate){
		if(colName && tableName){
			var gr = new GlideRecord('sys_dictionary');
			var tableCondition = gr.addQuery('name', tableName);
			tableCondition.addOrCondition('name', 'kb_knowledge');
			gr.addQuery('element', colName);
			gr.query();
			var hasNext = gr.next();
			if(hasNext || this.validateATFieldName(columnLabel, articleTemplate))
				return 'nameExists';
		}
		return '';
	},
	
	validateATFieldName : function(columnName, atId){
		if(columnName && atId){
			var gr = new GlideRecord('kb_article_template_definition');
			gr.addQuery('article_template', atId);
			gr.addQuery('column_label', columnName);
			gr.query();
			return gr.hasNext();
		}
		return false;
	},
	
	validateColumnName : function(){
		var columnName = this.getParameter('column_name') + '';
		var colName = this.getNameFromLabel(columnName, 'kb_', false);
		if(colName == '')
			return 'invalidName';
		var atId	= this.getParameter('article_template_id') + '';
		var gr = new GlideRecord('kb_article_template');
		gr.get(atId);
		return this.validateColumnNameWithParams(colName, gr.child_table + '', columnName, atId);
	},
	
	getTableName : function (tableSysId){
		var gr = new GlideRecord('sys_db_object');
		if(tableSysId){
			gr.get(tableSysId);
			return gr.name;
		}
		return null;
	},
	
	getTableSysId : function(tableName){
		if(tableName){
			var tableGR = new GlideRecord('sys_db_object');
			tableGR.addQuery('name', tableName);
			tableGR.query();
			if(tableGR.next()){
				return tableGR.sys_id;
			}
		}
		return null;
	},
	
	createKnowledgeChildTable : function(tableName, tableLabel){
		if(gs.hasRole('knowledge_admin') || gs.hasRole('admin')){
			var tc = new GlideTableCreator(tableName, tableLabel);
			var attrs = new Packages.java.util.HashMap();
			tc.setExtends('kb_knowledge');
			tc.setColumnAttributes(attrs);
			var updateSuccessful = tc.update();
			if(updateSuccessful == true || updateSuccessful == 'true'){
				var tableSysId = this.getTableSysId(tableName);
				this.configureApprovalRelatedList(tableName); 
				if (pm.isActive('com.glideapp.knowledge.i18n2'))
					this.configureTranslatedVersionRelatedList(tableName);
				var kbCommon = new KBCommon();
				if(!gs.nil(kbCommon.getIndexFilterConfiguredForTable('kb_knowledge')))
					kbCommon.installIndexFilterForTable(tableName, kbCommon.getIndexFilterForTable(tableName), false);
				return tableSysId;
			}
		}
		return null;
	},
	
	configureApprovalRelatedList : function(tableName){
		var lists = new GlideRecord('sys_ui_list_control');
		lists.addQuery('name','kb_knowledge');
		lists.addQuery('related_list','REL:8e1ddaa3c30321000096dfdc64d3aebd');
		lists.query();
		
		if(lists.next()){
			lists.name = tableName;
			lists.insert();
		}
	},
	
	configureTranslatedVersionRelatedList : function(tableName){
		var lists = new GlideRecord('sys_ui_list_control');
		lists.addQuery('name','kb_knowledge');
		lists.addQuery('related_list','REL:6b04aaa10a0a0b9a00bd55d1e6f0782d');
		lists.query();
		
		if(lists.next()){
			lists.name = tableName;
			lists.insert();
		}
	},
	updateSysDictionaryProperties : function(tableName){
		var sysDGR = new GlideRecord('sys_dictionary');
		sysDGR.addQuery('name', tableName);
		sysDGR.addQuery('internal_type', 'collection');
		sysDGR.query();
		if(sysDGR.next()){
			sysDGR.text_index = true;
			sysDGR.audit = true;
			sysDGR.attributes = 'document_viewer_audit=all,global_search_config_handler=KnowledgeArticle,all_tables.text_index_translations=true,attachment_index=true,text_index_attachment_displayed=true,text_index_enable_idf=true,synch_attachments=true,use_document_viewer=true,text_index_filter_junk=false';
			sysDGR.update();
		}
		
	},
	
	createInterceptorEntry : function(articleType, tableName){
		var sysId = '';
		var ie = new GlideRecord('sys_wizard_answer');
		ie.addQuery('question', '446e65e30b0003003c328ffe15673a81');
		ie.addQuery('name', articleType);
		ie.addQuery('answer', articleType);
		ie.addQuery('target_url', tableName + '.do');
		ie.query();
		if(ie.next()){
			sysId = ie.sys_id;
			if(current.active == false){
				ie.active = current.active;
				ie.update();
			}
		}
		else{
			ie = new GlideRecord('sys_wizard_answer');
			ie.initialize();
			ie.question.sys_id = '446e65e30b0003003c328ffe15673a81';
			ie.name = articleType;
			ie.answer = articleType;
			ie.target_url = tableName + '.do';
			ie.type = 'Answer';
			ie.active = current.active;
			sysId = ie.insert();
		}
		this.updateInterceptorWizard(ie, 'create', current.active);
		return sysId;
	},
	
	updateInterceptorEntry : function(currentValue, previousValue){
		var ie = new GlideRecord('sys_wizard_answer');
		var hasUpdates = false, activeFlagChange = false;
		
		if(ie.get(currentValue.answer_ref)){
			if(currentValue.article_template != previousValue.article_template){
				ie.name = currentValue.article_template;
				ie.answer = currentValue.article_template;
				hasUpdates = true;
			}
			if(currentValue.active != previousValue.active){
				ie.active = currentValue.active;
				hasUpdates = true;
				activeFlagChange = true;
			}
			if(hasUpdates){
				ie.update();
			}
			if(activeFlagChange){
				this.updateInterceptorWizard(ie, 'update', currentValue.active);
			}
		}
	},
	
	updateInterceptorWizard : function(glideRecord, operation, activeFlag){
		if(activeFlag == true){
			if(!glideRecord.question.intercepts){
				glideRecord.question.intercepts = 'kb_knowledge.do';
				glideRecord.updateWithReferences();
			}
		}
		else{
			var gr = new GlideRecord('sys_wizard_answer');
			gr.addQuery('question', '446e65e30b0003003c328ffe15673a81');
			gr.addQuery('active', true);
			gr.query();
			if(gr.next()){
				if(gr.sys_id == 'e1ce29e30b0003003c328ffe15673ad3' && !gr.hasNext()){
					gr.question.intercepts = '';
					gr.updateWithReferences();
				}
			}
		}
	},
	
	createCustomRendererForTemplate: function(tableName){
		var tag = 'sn-knowledge-discussion-wrapper';
		var knowledgeRenderer = new GlideRecord('sys_aw_renderer');
		knowledgeRenderer.addQuery('table','kb_knowledge');
		knowledgeRenderer.addQuery('workspace_config','7b24ceae5304130084acddeeff7b12a3');
		knowledgeRenderer.query();
		if(knowledgeRenderer.next()){
			knowledgeRenderer.table = tableName;
			knowledgeRenderer.insert();
		}
	},
	
	getNameFromLabel : function(label, commonPrefix, includeScope){
		var prefix = '';
		if (!gs.hasRole('maint')){
			prefix = 'u_' + commonPrefix;
		}
		else{
			prefix = commonPrefix;
		}
		if(label){
			var name = prefix + label.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
			while (name.indexOf("__") != -1) {
				name = name.replace(/__/g, "_");
			}
			while (name != '' && name.charAt(name.length - 1) == '_') {
				name = name.substring(0, name.length - 1);
			}
			if(name + '_' == prefix){
				name = '';
			}
			
			return name;
		}
		else{
			return '';
		}
	},
	
	activeTemplatesFound : function(){
		var gr = new GlideRecord('sys_wizard_answer');
		gr.addQuery('question', '446e65e30b0003003c328ffe15673a81');
		gr.addQuery('active', true);
		gr.query();
		if(gr.next()){
			if(gr.sys_id == 'e1ce29e30b0003003c328ffe15673ad3' && !gr.hasNext()){
				return false;
			}
			else{
				return true;
			}
		}
		return false;
	},

	getArticleTemplatesForKnowledgeBase: function(kbId, addNames){
		var gr = new GlideRecord('kb_template_m2m_knowledge_base');
		gr.addQuery('kb_knowledge_base',kbId);
		gr.orderBy('kb_article_template');
		gr.query();

		var templates = {};
		var kbGr = new GlideRecordSecure('kb_knowledge_base');
		// Default for backward compatibility
		var showStandard = true;
		if (kbGr.get(kbId) && kbGr.disable_standard_template.toString() == 'true') {
		showStandard = false;
		}
		
		// Only add Standard template if disable_standard_template is false (or not set)
		if(showStandard){
			if(addNames)
			templates['kb_knowledge'] = gs.getMessage('Standard');
			else
			templates['kb_knowledge'] = true;
		}
		
		if(!gr.hasNext()){
			var template = new GlideRecord('kb_article_template');
			template.addActiveQuery();
			template.orderBy('article_template');
			template.query();
			while(template.next()){
				if(addNames)
					templates[template.child_table] = this._getFieldLabelInUserLang(template.child_table, null, template.getDisplayValue('article_template'));
				else
					templates[template.child_table] = true;
			}
			return templates;
		}
		else {
			while(gr.next()){
				if(gr.kb_article_template.active){
					if(addNames)
						templates[gr.kb_article_template.child_table] = this._getFieldLabelInUserLang(gr.kb_article_template.child_table, null, gr.kb_article_template.getDisplayValue());
					else
						templates[gr.kb_article_template.child_table] = true;
				}
			}
		}
		return templates;
	},

	getCanContributeTemplatesList: function(kbId){
		var kbGr = new GlideRecord('kb_knowledge_base');
		if(kbGr.get(kbId) && SNC.KnowledgeHelper.canContribute(kbGr))
			return this.getArticleTemplatesForKnowledgeBase(kbId,true);
		else
			return {};
	},
	
	getCanContributeKBForTemplate: function(tableName){
		var contributableKbs = JSON.parse(new SNC.KnowledgeHelper().getMyWritableKnowledgeBases());
		var kbs = {};
		if(contributableKbs.length == 0)
			return kbs;
		if(tableName === 'kb_knowledge'){
			contributableKbs.forEach(function(kb){
				kbs[kb.sys_id] = kb.title;
			});
			return kbs;
		}
		var gr = new GlideRecord('kb_template_m2m_knowledge_base');
		gr.addQuery('kb_knowledge_base','IN',contributableKbs.map(function(kb){
			return kb.sys_id;
		})).join(',');
		gr.orderBy('kb_knowledge_base');
		gr.query();
		
		var excludeKbList ={};
		var kb = '', hasTemplate = false;
		while(gr.next()){
			if(kb === ''){
				kb = gr.getValue('kb_knowledge_base');
			}
			if(kb != gr.getValue('kb_knowledge_base')) {
				if(!hasTemplate){
					excludeKbList[kb] = true;
				}
				hasTemplate = false;
				kb = gr.getValue('kb_knowledge_base');
			}
			
			if(gr.kb_article_template.child_table == tableName) {
				hasTemplate = true;
			}
		}
		if(!hasTemplate && kb != ''){
			excludeKbList[kb] = true;
		}
		contributableKbs.filter(function(kb){
			return !excludeKbList[kb.sys_id];
		}).forEach(function(kb){
			kbs[kb.sys_id] = kb.title;
		});
		return kbs;
	},
	
   /**
	* returns the Preview Text to be displayed in article template selector for the Standard Article Template. 
	* Empty value will display random text. Override this function in ArticleTemplateUtil Script Includes to set the desired text.
	*
	*/
	setPreviewTextForStandardArticle: function(){
		return null;
	},
	
	getFieldsDataForTemplate: function(template){
		var fields = [];
		
		if(template == 'kb_knowledge'){
			fields.push( {
				field: '',
				type: 'HTML',
				preview_text: this.setPreviewTextForStandardArticle(),
			});
			return fields;
		}
		
		var gr = new GlideRecord('kb_article_template_definition');
		gr.addQuery('article_template.child_table',template);
		gr.addActiveQuery();
		gr.orderBy('order');
		gr.query();
		
		while(gr.next()){
			var collapsible, collapsed, collapse_type = gr.getValue('collapsible');
			if(collapse_type == 'expanded'){
				collapsible = true;
				collapsed = false;
			} else if(collapse_type == 'collapsed') {
				collapsible = true;
				collapsed = true;
			} else {
				collapsible = false;
				collapsed = false;
			}
			fields.push( {
				field: this._getFieldLabelInUserLang(template,gr.getValue('table_column'),gr.getDisplayValue('column_label')),
				type: gr.getDisplayValue('column_type'),
				column: gr.getValue('table_column'),
				collapsible: collapsible,
				collapsed: collapsed,
				heading_style: gr.getDisplayValue('heading_style'),
				field_style: gr.getDisplayValue('field_style'),
				preview_text: gr.getDisplayValue('preview_text'),
			});
		}

		return fields;
	},
	
	getHTMLFieldsDataForTemplate: function(tableName){
		var fields = [];
		
		var kbViewModel = new KBViewModel();
		if (kbViewModel.isArticleTemplate(tableName)) {
			var gr = new GlideRecord('kb_article_template_definition');
			gr.addQuery('article_template.child_table',tableName);
			gr.addActiveQuery();
			gr.addQuery('column_type','IN','html,translated_html');
			gr.orderBy('order');
			gr.query();

			while (gr.next()) {
				fields.push({
					column: gr.getValue('table_column'),
				});
			}
		} else {
			fields.push({
				column: 'text',
			});
		}
		
		return fields;
	},
	
	canContributeToTemplates: function() {
		if(!new SNC.KnowledgeHelper().isAContributor())
			return false;
			
		var template = new GlideRecord('kb_article_template');
		template.addActiveQuery();
		template.query();
		
		if(!template.hasNext())
			return false;
		
		return true;
	},

	canContribute : function() {
		if(!new SNC.KnowledgeHelper().isAContributor())
			return false;

		return true;
	},
	
	templateExistsForKB: function(kb, template){
		if(!new SNC.KnowledgeHelper().getArticleTemplateName(template))
			return true;
		
		var gr = new GlideRecord('kb_template_m2m_knowledge_base');
		gr.addQuery('kb_knowledge_base',kb);
		gr.query();
		
		if(!gr.hasNext())
			return true;

		while(gr.next()) {
			if(gr.kb_article_template.child_table == template)
				return true;
		}

		return false;
	},
	
	templatesUsedInKB: function(kbId){
		var templates = {};
		var agg = new GlideAggregate("kb_knowledge");
		agg.addQuery('sys_class_name', '!=', 'kb_knowledge');
		agg.addQuery('sys_class_name', '!=', 'kb_knowledge_block');
		agg.addQuery('kb_knowledge_base',kbId);
		agg.addEncodedQuery('workflow_state!=retired^workflow_state!=outdated');
		agg.addActiveQuery();
		
		agg.addAggregate('count');
		agg.groupBy('sys_class_name');
		
		agg.query();
		while (agg.next()) {
			templates[agg.sys_class_name] = new GlideRecord(agg.sys_class_name).getClassDisplayValue();
		}
		return templates;
	},
	
	isTemplateUsedInKB: function(template, kb) {
		var gr = new GlideRecord(template);
		gr.addQuery('kb_knowledge_base',kb);
		gr.addEncodedQuery('workflow_state!=retired^workflow_state!=outdated');
		gr.addActiveQuery();
		gr.query();
		
		return gr.hasNext();
	},
	
	validateOperation: function(current, previous, operation){
		if(operation === 'insert') {
			var gr = new GlideRecord('kb_template_m2m_knowledge_base');
			gr.addQuery('kb_knowledge_base',current.getValue('kb_knowledge_base'));
			gr.addQuery('kb_article_template',current.getValue('kb_article_template'));
			gr.query();
			
			return gr.hasNext();
		}
		else  if(operation === 'update'){
			if(current.kb_knowledge_base.changes() || current.kb_article_template.changes()){
				if(!this.isTemplateUsedInKB(previous.kb_article_template.child_table, previous.getValue('kb_knowledge_base'))){
					var mapGr = new GlideRecord('kb_template_m2m_knowledge_base');
					mapGr.addQuery('kb_knowledge_base',current.getValue('kb_knowledge_base'));
					mapGr.addQuery('kb_article_template',current.getValue('kb_article_template'));
					mapGr.query();

					if(!mapGr.hasNext())
						return false;
				}
				gs.addErrorMessage(gs.getMessage('{0} cannot be deleted as it is being used by articles in {1} knowledge base.',[
					'<b>' + previous.kb_article_template.getDisplayValue() + '</b>', 
					'<b>' + previous.kb_knowledge_base.getDisplayValue() + '</b>'
				]));
				return true;
			}
			else
				return false;
		}
		else {
			if(!this.isTemplateUsedInKB(current.kb_article_template.child_table, current.getValue('kb_knowledge_base')))
				return false;
			gs.addErrorMessage(gs.getMessage('{0} template cannot be deleted. It is being used by articles in {1} knowledge base.',[
				'<b>' + current.kb_article_template.getDisplayValue() + '</b>', 
				'<b>' + current.kb_knowledge_base.getDisplayValue() + '</b>'
			]));
			return true;
		}
	},
	
	checkAndAddTemplates: function(kbId, template){
		var gr = new GlideRecord('kb_template_m2m_knowledge_base');
		gr.addQuery('kb_knowledge_base',kbId);
		gr.addQuery('kb_article_template.child_table','!=',template);
		gr.query();
		
		if(!gr.hasNext()){
			var templates = this.templatesUsedInKB(kbId);
			delete templates[template];
			if(Object.keys(templates).length == 0)
				return;
			
			var templateGr = new GlideRecord('kb_article_template');
			templateGr.addQuery('child_table', 'IN', Object.keys(templates).join(','));
			templateGr.query();
			
			while(templateGr.next()){
				var map = new GlideRecord('kb_template_m2m_knowledge_base');
				map.setValue('kb_knowledge_base',kbId);
				map.setValue('kb_article_template', templateGr.getUniqueValue());
				map.setWorkflow(false);
				map.insert();
			}
		}
	},

	getWarningPopUpContent: function(kb){
		var templates = this.templatesUsedInKB(kb);
		if(Object.keys(templates).length == 0)
			return '';
		
		var query = 'active=true^workflow_state!=retired^workflow_state!=outdated^kb_knowledge_base=' + kb;
		
		var links = Object.keys(templates).map(function(template){
			var url = '/' + template + '_list.do?sysparm_query=' + query;
			return '<a target="_blank" href="' + url + '">' + GlideStringUtil.escapeHTML(templates[template]) + '</a>';
		});
		
		return gs.getMessage('Article templates {0} are being used by existing articles. They are added by default to this knowledge base.', links.join(', '));
	},

	getFieldsForTemplate: function(){
		var template = this.getParameter("sysparm_template");
		var fields = this.getFieldsDataForTemplate(template);
		var result = {
			fields: fields,
			template: template
		};
		return JSON.stringify(result);
	},
	
	getTemplatesDataForKB: function(){
		var kbId = this.getParameter("sysparm_kbid");
		var templates = this.getCanContributeTemplatesList(kbId);		
		var result = {
			templates: templates,
			kb: kbId
		};
		return JSON.stringify(result);
	},

	getFieldLabel: function(field, article) {
		if (new GlidePluginManager().isActive('com.glideapp.knowledge.i18n2') && !gs.nil(article.language)) {
			var gr = new GlideRecord('sys_documentation');
			gr.addQuery('name', article.sys_class_name);
			gr.addQuery('element', field);
			gr.addQuery('language', article.language);
			gr.query();
			if (gr.next())
				return gr.getValue('label');
		}
		return article[field].getLabel();
	},
	
	getArticleContentData: function(classname, sys_id, userId, blocksArray) {
		
		var isPreview = false;
		var previewAsUser = gs.nil(userId)?gs.getUserID():userId;
		if(!gs.nil(blocksArray))
			isPreview = true;
		var data = [];	
		var article = new GlideRecord(classname);
		if(article.get(sys_id)){
			var gr = new GlideRecord('kb_article_template_definition');
			gr.addQuery('article_template.child_table', classname);
			gr.addActiveQuery();
			gr.orderBy('order');
			gr.query();

			while(gr.next()) {
				var column = gr.getValue('table_column');
				if(!this._canReadColumn(article, column, previewAsUser))
					continue;
				
				var fieldData = {};
				fieldData.label = this.getFieldLabel(column, article);
				if (new GlidePluginManager().isActive('com.snc.knowledge_blocks')){
				if(isPreview)
					fieldData.content = new SNC.KnowledgeBlockSubstitution().substituteBlockOnDate(article.getUniqueValue(), article.getDisplayValue(gr.table_column), previewAsUser, blocksArray);
				else
					fieldData.content = new SNC.KnowledgeBlockSubstitution().substituteBlock(article.getUniqueValue(), article.getDisplayValue(gr.table_column), previewAsUser);
				
				} else 
					fieldData.content = article.getDisplayValue(gr.table_column);
				
				if(!fieldData.content || fieldData.content == 'null')
					continue;
				
				if(fieldData.content.replace(/\r|\n|\xa0|\s|<(p|br|\/p)[^>]*>/g, '').length == 0)
					continue;
				
				fieldData.column = column;
				fieldData.type = gr.getValue('column_type');
				
				var collapsible = gr.getValue('collapsible');
				if(collapsible === 'expanded'){
					fieldData.collapsible = true;
					fieldData.collapsed = false;
				} else if(collapsible == 'collapsed') {
					fieldData.collapsible = true;
					fieldData.collapsed = true;
				} else {
					fieldData.collapsible = false;
					fieldData.collapsed = false;
				}
				
				fieldData.heading_style = gr.getValue('heading_style');
				fieldData.field_style = gr.getValue('field_style');
				data.push(fieldData);
			}
		}
		return data;
	},

	getArticleContentDataWithoutBlocks: function(classname, sys_id, userId) {

        var previewAsUser = gs.nil(userId) ? gs.getUserID() : userId;
        var data = [];
        var article = new GlideRecord(classname);
        if (article.get(sys_id)) {
            var gr = new GlideRecord('kb_article_template_definition');
            gr.addQuery('article_template.child_table', classname);
            gr.addActiveQuery();
            gr.orderBy('order');
            gr.query();

            while (gr.next()) {
                var column = gr.getValue('table_column');
                if (!this._canReadColumn(article, column, previewAsUser))
                    continue;

                var fieldData = {};
                fieldData.label = this.getFieldLabel(column, article);
                if (new GlidePluginManager().isActive('com.snc.knowledge_blocks')) {
                    fieldData.content = new SNC.KnowledgeBlockSubstitution().substituteBlockWithReplacementText(article.getUniqueValue(), article.getDisplayValue(gr.table_column), '',previewAsUser);

                } else
                    fieldData.content = article.getDisplayValue(gr.table_column);

                if (!fieldData.content || fieldData.content == 'null')
                    continue;

                if (fieldData.content.replace(/\r|\n|\xa0|\s|<(p|br|\/p)[^>]*>/g, '').length == 0)
                    continue;

                fieldData.column = column;
                fieldData.type = gr.getValue('column_type');

                var collapsible = gr.getValue('collapsible');
                if (collapsible === 'expanded') {
                    fieldData.collapsible = true;
                    fieldData.collapsed = false;
                } else if (collapsible == 'collapsed') {
                    fieldData.collapsible = true;
                    fieldData.collapsed = true;
                } else {
                    fieldData.collapsible = false;
                    fieldData.collapsed = false;
                }

                fieldData.heading_style = gr.getValue('heading_style');
                fieldData.field_style = gr.getValue('field_style');
                data.push(fieldData);
            }
        }
        return data;
    },

	createRouteMappingForTemplate: function(tableName, routeConfig) {
		//default value is for CSM/FSM Workspace routing
		if (!routeConfig)
			routeConfig = '5320e8f7531f10102c30ddeeff7b128f';

		var routeMapping = new GlideRecord('sys_ux_dynamic_route_mapping');
		routeMapping.addQuery('table','kb_knowledge');
		routeMapping.addQuery('route_config', routeConfig);
		routeMapping.addQuery('source_component','!=','agent_assist_1');
		routeMapping.query();
		while(routeMapping.next()){
			routeMapping.table = tableName;
			routeMapping.insert();
		}
	},
    
	_getFieldLabelInUserLang: function(tableName, element, columnLabel) {
		if (new GlidePluginManager().isActive('com.glideapp.knowledge.i18n2') && !gs.nil(gs.getUser().getLanguage())) {
			var gr = new GlideRecord('sys_documentation');
			gr.addQuery('name', tableName);
			if (!gs.nil(element))
				gr.addQuery('element', element);
			else
				gr.addNullQuery('element');
			gr.addQuery('language', gs.getUser().getLanguage());
			gr.query();
			if (gr.next() && !gr.label.isNil())
				return gr.getValue('label');
		}
		return columnLabel;
	},

	_canReadColumn: function canReadColumn(article, column, previewAsUser) {
    	if (previewAsUser && previewAsUser !== gs.getUserID()) {
			// Uses Java-layer impersonation (com.glide.sys.Impersonate)
			// which works in portal context, unlike gs.getSession().impersonate()
			return new SNC.KnowledgeHelper().canUserReadField(
				previewAsUser,
				article.getTableName(),
				column,
				article.getUniqueValue()
			);
		} else {
			return article[column].canRead();
    	}
	},
    /**
     * Checks if there are articles using the standard template in the given knowledge base
     * @param {String} kbSysId - The sys_id of the knowledge base
     * @returns {Number} - Count of articles using standard template
     */
    hasArticlesUsingStandardTemplate: function(kbSysId) {
        var gr = new GlideRecordSecure('kb_knowledge');
        gr.addQuery('kb_knowledge_base', kbSysId);
        gr.addQuery('sys_class_name', 'kb_knowledge');
        gr.query();
        return gr.getRowCount();
    },
	type: 'ArticleTemplateUtilSNC'
});
