var KBSemanticHTMLCheckerUtilSNC = Class.create();
KBSemanticHTMLCheckerUtilSNC.prototype = {
    duplicateCheckElementObj: {
        'h1': 1
    },
    requiredElemAttrsObj: {
        'img': ['alt', 'title'],
        'a': ['href', 'title'],
    },
    issueMsgsObj: {
        'img': {
            'alt': gs.getMessage('Missing alternative description'),
            'title': gs.getMessage('Missing title'),
        },
        'a': {
            'href': gs.getMessage('Missing href'),
            'title': gs.getMessage('Missing title'),
        },
        'h1': {
            'duplicate_tag': gs.getMessage('More than one H1 tag is not recommended')
        },
    },
    initialize: function() {},

    /**
     * Check if SEO property 'sn_km_portal.glide.knowman.serviceportal.seo_portals' is enabled for the knowledge base of the article
     * @param {String} articleKnowledgeBaseId - sys_id of the knowledge base of article
     * @returns {Boolean} - True if SEO property is enabled; false otherwise
     */
    isSEOPropertyEnabled: function(articleKnowledgeBaseId) {
        var portalIds = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.seo_portals', '').trim().replace(/,+$/, '').split(',');
        var gr = new GlideRecord('m2m_sp_portal_knowledge_base');
        var encodedQuery = 'sp_portal=' + portalIds.join('^ORsp_portal=') + '^kb_knowledge_base=' + articleKnowledgeBaseId;
        gr.addEncodedQuery(encodedQuery);
        gr.query();
        if (gr.next())
            return true;
        return false;
    },

    /**
    * Find all Nodes for a list of HTML tag names
	* @param {Array} tagList - List of all tag names to be searched
	* @param {Node} tempRootElementNode - Temporary root node of the htmlDoc
	* @returns {Object} - Key value pairs of tag name and corresponding Node List
	Sample Object returned:
	{
		'h1': [Node1, Node2...],
		'a': [Node1, Node2...],
		'img': [Node1, Node2...]
	}
    */
    getTagElementNodes: function(tagList, tempRootElementNode) {
        var uniquetagList = tagList.filter(function(value, index, array) {
            return array.indexOf(value) === index;
        });
        var foundTagNodesObj = {};
        for (var i = 0; i < uniquetagList.length; i++) {
            var allTagElements = GlideXMLUtil.selectNodes(tempRootElementNode, './/' + uniquetagList[i]);
            if (!foundTagNodesObj[uniquetagList[i]]) {
                foundTagNodesObj[uniquetagList[i]] = allTagElements;
            }
        }
        return foundTagNodesObj;
    },

    /**
     * Get text found inside the opening and closing tag of an HTML element
     * @param {Node} tagNode - HTML element Node
     * @param {String} tagName - Name of the tag for which the issues need to be found
     * @returns {String} - Text found inside the opening and closing tag of an HTML element
     */
    getTextInsideElementTags: function(tagNode, tagName) {
        var textInsideElementTags = GlideXMLUtil.getText(tagNode);
        if (tagName == 'img' && !textInsideElementTags) {
            textInsideElementTags = GlideXMLUtil.getAttribute(tagNode, 'title');
            textInsideElementTags = textInsideElementTags ? textInsideElementTags : GlideXMLUtil.toString(tagNode, true);
        } else {
            textInsideElementTags = textInsideElementTags ? textInsideElementTags : GlideXMLUtil.toString(tagNode, true);
        }
        return textInsideElementTags;
    },

    /**
    * Update the foundIssuesObj Object by adding a new SEO issue
    * @param {String} tableColumn - Name of the column in the article
	* @param {String} tagName - name of the tag for which the issues need to be found
	* @param {String} nodeHTML - The html string of a Node used as a unique identifier for the Node
	* @param {String} issueType - Category of issue like 'href', 'title', 'alt', 'duplicate_tag'
	* @param {String} textInsidetagNode - Text found inside the opening and closing tag of an HTML element
	* @param {Object} foundIssuesObj - Object containing all information about all SEO issues found till particular point of time
	Sample foundIssuesObj Object:
  	{
        "total_count": 3,
        "fields": {
            "Article body": {
                "h1": {
                    "count": 1,
                    "issue_list": {
                        "<h1>this is a heading level 1 text</h1>": {
                            "tag_location": "this is a heading level 1 text",
                            "issues": [
                                "More than one H1 tag is not recommended"
                            ]
                        }
                    }
                },
                "img": {
                    "count": 1,
                    "issue_list": {
                        "<img height='75' src='sys_attachment.do?sys_id=a228606b6cb16510f87753cf6bec9b4c' width='100'/>": {
                            "tag_location": '<img alt="" height="75" src="sys_attachment.do?sys_id=a228606b6cb16510f87753cf6bec9b4c" width="100"/>',
                            "issues": [
                                "Missing alternative description",
                                "Missing title"
                            ]
                        }
                    }
                },
            },
            "KBB0000101": {
                "a": {
                    "count": 1,
                    "issue_list": {
                        "<a href='http://www.google.com' rel='nofollow'>click here</a>": {
                            "tag_location": "click here",
                            "issues": [
                                "Missing title"
                            ]
                        }
                    }
                }
            }
        }
    }
    */
    _addIssueTofoundIssuesObj: function(tableColumn, tagName, nodeHTML, foundIssuesObj, issueType, textInsidetagNode) {
		if(!foundIssuesObj['fields'][tableColumn])
			foundIssuesObj['fields'][tableColumn] = {};
        if (foundIssuesObj['fields'][tableColumn] && foundIssuesObj['fields'][tableColumn][tagName]) {
            if (foundIssuesObj['fields'][tableColumn][tagName]['issue_list'][nodeHTML] && foundIssuesObj['fields'][tableColumn][tagName]['issue_list'][nodeHTML]['issues'].indexOf(issueType) == -1) {
				foundIssuesObj['fields'][tableColumn][tagName]['issue_list'][nodeHTML]['issues'].push(issueType);
            }
			else if(!foundIssuesObj['fields'][tableColumn][tagName]['issue_list'][nodeHTML]) {
                foundIssuesObj['fields'][tableColumn][tagName]['issue_list'][nodeHTML] = {
                    'tag_location': textInsidetagNode,
                    'issues': [issueType]
                };
                foundIssuesObj['fields'][tableColumn][tagName]['count'] += 1;
                foundIssuesObj['total_count'] += 1;
            }
        }
		else {
            foundIssuesObj['fields'][tableColumn][tagName] = {
                'count': 1,
                'issue_list': {}
            };
            foundIssuesObj['fields'][tableColumn][tagName]['issue_list'][nodeHTML] = {
                'tag_location': textInsidetagNode,
                'issues': [issueType],
            };
            foundIssuesObj['total_count'] += 1;
        }
    },

    /**
     * Finds SEO issues where a duplicate tag elements has been identified, by updating the foundIssuesObj Object
     * @param {String} tableColumn - Name of the column in the article
     * @param {String} tagName - Name of the tag for which the issues need to be found
     * @param {Array} tagNodeList - List of Element Nodes found for the particular tag name
     * @param {Integer} countThreshold - Threshold value for HTML element to be called as duplicate
     * @param {Object} foundIssuesObj - Object containing all information about all SEO issues found till particular point of time
     * @param {String} checkForSingleIssue - Check for the first SEO issue found and return
     * @returns {Boolean} when checkForSingleIssue is set to true
     */
    _getDuplicateElementIssuesForTag: function(tableColumn, tagName, tagNodeList, countThreshold, foundIssuesObj, checkForSingleIssue) {
        if (tagNodeList.length >= countThreshold) {
            if (checkForSingleIssue)
				return true;
            for (var i = 0; i < tagNodeList.length; i++) {
                var tagNode = tagNodeList.item(i);
                var textInsidetagNode = this.getTextInsideElementTags(tagNode, tagName);
                this._addIssueTofoundIssuesObj(tableColumn, tagName, GlideXMLUtil.toString(tagNode, true), foundIssuesObj, this.issueMsgsObj[tagName]['duplicate_tag'], textInsidetagNode);
            }
        }
    },

    /**
     * Finds tags that have the required attributes missing, by updating the foundIssuesObj Object
     * @param {String} tableColumn - Name of the column in the article
     * @param {String} tagName - name of the tag for which the issues need to be found
     * @param {Array} tagNodeList - List of Element Nodes found for the particular tag name
     * @param {Object} foundIssuesObj - Object containing all information about all SEO issues found till particular point of time
     * @param {String} checkForSingleIssue - Check for the first SEO issue found and return
     * @returns {Boolean} when checkForSingleIssue is set to true
     */
    _getMissingTagAttributeIssuesForTag: function(tableColumn, tagName, tagNodeList, foundIssuesObj, checkForSingleIssue) {
        for (var i = 0; i < tagNodeList.length; i++) {
            var tagNode = tagNodeList.item(i);
            var allAttrsList = this.requiredElemAttrsObj[tagName];
            for (var j = 0; j < allAttrsList.length; j++) {
                var attrName = allAttrsList[j];
                var attrValue = GlideXMLUtil.getAttribute(tagNode, attrName);
                if (!attrValue) {
                    if (checkForSingleIssue)
				        return true;
                    var textInsidetagNode = this.getTextInsideElementTags(tagNode, tagName);
                    this._addIssueTofoundIssuesObj(tableColumn, tagName, GlideXMLUtil.toString(tagNode, true), foundIssuesObj, this.issueMsgsObj[tagName][attrName], textInsidetagNode);
                }
            }
        }
    },

    /**
     * Finds the SEO related issues for the supplied HTML string
     * @param {String} tableColumn - Name of the column in the article
	 * @param {String} htmlStr - String content of the knowledge record column
	 * @param {Object} foundIssuesObj - Object containing all information about all SEO issues found till particular point of time
	 * @param {Boolean} checkForSingleIssue - Check for the first SEO issue found and return
     * @returns {Boolean} when checkForSingleIssue is set to true else returns {Object} -  Object containing the issue count and the list of all SEO issues associated with the article
     */
    getIssuesInfo: function(tableColumn, htmlStr, foundIssuesObj, checkForSingleIssue) {
        var htmlDoc = GlideXMLUtil.parse("<temp_root_element>" + htmlStr + "</temp_root_element>");
        var tempRootElementNode = GlideXMLUtil.getElementByTagName(htmlDoc, 'temp_root_element');
        var foundTagNodesObj = this.getTagElementNodes([].concat(Object.keys(this.duplicateCheckElementObj)).concat(Object.keys(this.requiredElemAttrsObj)), tempRootElementNode);
        var tagNameList = Object.keys(foundTagNodesObj);
        for (var i = 0; i < tagNameList.length; i++) {
            var tagName = tagNameList[i];
            var tagNodeList = foundTagNodesObj[tagName];
            if (this.duplicateCheckElementObj[tagName]) {
                var isIssueFound = this._getDuplicateElementIssuesForTag(tableColumn, tagName, tagNodeList, this.duplicateCheckElementObj[tagName], foundIssuesObj, checkForSingleIssue);
                if (isIssueFound && checkForSingleIssue)
					return true;
            }
            if (this.requiredElemAttrsObj[tagName]) {
                var isIssueFound = this._getMissingTagAttributeIssuesForTag(tableColumn, tagName, tagNodeList, foundIssuesObj, checkForSingleIssue);
                if (isIssueFound && checkForSingleIssue)
					return true;
            }
        }
        if (checkForSingleIssue)
			return false;
        return foundIssuesObj;
    },

    /**
    * Find HTML field names and labels
	* @param {String} tableName - Table name of the article template
	* @returns {Object} - Information about the HTML fields name and label for article template
    */
	getHTMLFieldsDataForTemplate: function(tableName){
		var fields = [];
		
		var kbViewModel = new KBViewModel();
		if (GlidePluginManager.isActive("com.snc.knowledge_advanced") && kbViewModel.isArticleTemplate(tableName)) {
			var gr = new GlideRecord('kb_article_template_definition');
			gr.addQuery('article_template.child_table',tableName);
			gr.addActiveQuery();
			gr.addQuery('column_type','IN','html,translated_html');
			gr.orderBy('order');
			gr.query();

			while (gr.next()) {
				fields.push({
					'column_name': gr.getValue('table_column'),
					'column_label': gr.getValue('column_label')
				});
			}
		} else {
			fields.push({
				'column_name': 'text',
				'column_label': 'Article body'
			});
		}
		
		return fields;
	},
    
    /**
    * Driver function to find all SEO related issues in an article
	* @param {GlideRecord Object} kbGr - KB glide record object
	* @param {Boolean} checkForSingleIssue - Check for the first SEO issue found and return
	* @param {String} articleSysId - sys_id of the article
	* @returns {Boolean} when checkForSingleIssue is set to true else returns {Object} 
    */
	getSEOIssuesFromArticle: function(kbGr, checkForSingleIssue, articleSysId){		
		if(!kbGr && articleSysId){
            // if kbGr is not passed, but articleSysId is passed
			kbGr = new GlideRecord('kb_knowledge');
			kbGr.get(articleSysId);
		}
		if( kbGr && new KnowledgeAccessSNC().contributorRight(kbGr) && this.isSEOPropertyEnabled(kbGr.kb_knowledge_base)){
			var tableName = kbGr.sys_class_name;
            var tableColumns = this.getHTMLFieldsDataForTemplate(tableName);

            var seoIssuesInfo = {
                'total_count': 0,
                'fields': {},
            };
            var templateGR = new GlideRecord(tableName);
            if(templateGR.get(kbGr.sys_id)){
                for(var i = 0; i < tableColumns.length; i++){
                    seoIssuesInfo = this.getIssuesInfo(tableColumns[i].column_label, templateGR.getValue(tableColumns[i].column_name), seoIssuesInfo, checkForSingleIssue);	
                    if(checkForSingleIssue && seoIssuesInfo)
                        return true;
                }
                // check if article has knowledge blocks added, if yes get SEO issues for them
                if(tableName != 'kb_knowledge_block' && GlidePluginManager().isActive('com.snc.knowledge_blocks')){
                    var kbbEncodedQuery = 'sys_idIN';
                    var m2mGr = new GlideRecord('m2m_kb_to_block_history');
                    m2mGr.addEncodedQuery("block_state=published^knowledge=" + kbGr.sys_id);
                    m2mGr.query();
                    while (m2mGr.next()){
                        kbbEncodedQuery += m2mGr.getValue('knowledge_block') + ',';
                    }
                    var kbbGr = new GlideRecord('kb_knowledge_block');
                    kbbGr.addEncodedQuery(kbbEncodedQuery);
                    kbbGr.query();
                    while(kbbGr.next()){
                        seoIssuesInfo = this.getIssuesInfo(kbbGr.number + ' - ' + kbbGr.short_description, kbbGr.getValue('text'), seoIssuesInfo, checkForSingleIssue);	
                        if(checkForSingleIssue && seoIssuesInfo)
                            return true;
                    }
                }
                if(checkForSingleIssue)
                    return false;
                return {
                    'can_access': true,
                    'kb_number': kbGr.number,
                    'kb_short_description': kbGr.short_description,
                    'seo_issues_info': seoIssuesInfo,
                    'issue_count_msg': gs.getMessage('{0} SEO suggestions found', [String(seoIssuesInfo['total_count'])]),
                };
            }
		}
        if(checkForSingleIssue)
            return false;
		return {
			'can_access': false,
		};
	},

	/**
    * Checks if msg should be displayed depending on SEO property, if user has write access on article and if there is atleast one SEO issue found; if yes, what should be the content of the message
	* @param {GlideRecord Object} kbGr - KB glide record object
	* @returns {Object} - Sample: {'show_msg': true, 'msg': 'For SEO suggestions on this article, click here.'}
    */
	getSEONotification: function(kbGr){
        var isIssueFound = this.getSEOIssuesFromArticle(kbGr, true);
        var instanceURL = gs.getProperty('glide.servlet.uri');
        if(isIssueFound){
            var result = {};
            result['show_msg'] = true;
            result['msg'] = gs.getMessage('For SEO suggestions on this article, click {0}here{1}.', ['<a href="'+ instanceURL +'kb_semantic_html_suggestions.do?sysparm_article_id=' + kbGr.sys_id + '" target="_blank">', '</a>']);
            return result;
        }
		return {'show_msg': false};
	},

    type: 'KBSemanticHTMLCheckerUtilSNC'
};
