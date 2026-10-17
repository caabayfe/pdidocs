var canContributeToTemplates = GlidePluginManager.isActive('com.snc.knowledge_advanced') && new ArticleTemplateUtil().canContributeToTemplates();

var incomingSource = g_request.getParameter('source') || '';
var shouldNavigateToKC = new KBCommon().shouldRedirectToKnowledgeCenter();
var allowedSources = [
	"",
	"kb_feedback_task"
];

if (shouldNavigateToKC && allowedSources.indexOf(String(incomingSource)) !== -1) {
    createKnowledgeArticleInKC();
} else {
    createKnowledgeArticleUI16();
}

// Helper Function starts

function isCategoryPartOfWrongKnowledgeBase(categoryId, knowledgeBaseId) {
    var categoryIds = new global.GlobalKnowledgeUtil().getCategoryIdsForKB(knowledgeBaseId);
    return !categoryIds.includes(categoryId);
}

function parseSysparmQuery(query) {
    var decodedQuery = decodeURIComponent(query);
    var params = decodedQuery.split('^');
    var result = {};
    params.forEach(function(param) {
        var keyValue = param.split('=');
        if (keyValue.length == 2)
            result[keyValue[0]] = keyValue[1];
    });

    return result;
}

function buildSysparmQuery(queryObject, skipKeys) {
    var parts = [];
    skipKeys = skipKeys || [];
    for (var key in queryObject) {
        if (skipKeys.indexOf(key) === -1) {
            parts.push(key + "=" + queryObject[key]);
        }
    }
    return parts.join('^');
}

function validateQuery(query) {
    var parsedQuery = this.parseSysparmQuery(query);

    if (parsedQuery.kb_knowledge_base && parsedQuery.kb_category) {
        if (this.isCategoryPartOfWrongKnowledgeBase(parsedQuery.kb_category, parsedQuery.kb_knowledge_base)) {
            var filteredSysparmQuery = this.buildSysparmQuery(parsedQuery, ["kb_category"]);
            return filteredSysparmQuery;
        }
    }

    return query;
}


function createKnowledgeArticleInKC() {
    var url = new KBCommon().redirectionUrlToKnowledgeCenter(g_request, canContributeToTemplates);
    g_response.sendRedirect(url);
}

function createKnowledgeArticleUI16() {
    var params = g_request.getParameterNames();

    var page = canContributeToTemplates ? 'kb_knowledge_create.do?' : 'kb_knowledge.do?';
    var sourceTable = g_request.getParameter('source');
    var sourceId = g_request.getParameter('source_id');

    var shouldSkipInterceptorPage = !canContributeToTemplates && sourceTable && sourceId;

    // handling the case where ITSM plugin is inactive but the submission prop is active
    shouldSkipInterceptorPage = handleIncidentSubmissionLogic(incomingSource,sourceId,shouldSkipInterceptorPage);

    var queryFromCSMtableMap = '';
    if (shouldSkipInterceptorPage) {
        var queryResult = getQueryAndPage(sourceTable, sourceId);
        queryFromCSMtableMap = queryResult.query;
        if (queryResult.page) {
            page = queryResult.page + ".do?";
        }
    }

    var pageParam = buildPageParam( params, shouldSkipInterceptorPage, queryFromCSMtableMap, page);

    var url = page + pageParam;
    g_response.sendRedirect(url);
}

function handleIncidentSubmissionLogic(incomingSource, sourceId, shouldSkipInterceptorPage) {
    if (incomingSource != 'incident') {
        return shouldSkipInterceptorPage;
    }

    var isSubmissionPropEnabled = gs.getProperty('glide.knowman.submission.workflow', 'false') == 'true';

    var isIncidentKcsPluginActive = GlidePluginManager.isActive('com.snc.incident.knowledge');

    if (isSubmissionPropEnabled && !isIncidentKcsPluginActive) {
        var incidentGr = new GlideRecordSecure('incident');

        if (incidentGr.get(sourceId)) {
            var EQ = '%5E'; // encoded ^
				var targetURL = 'kb_submission.do?sys_id=-1'
					+ '&sysparm_query=parent=' + sourceId
					+ EQ + 'short_description=' + encodeURIComponent(incidentGr.short_description)
					+ EQ + 'sys_domain='        + encodeURIComponent(incidentGr.sys_domain)
					+ EQ + 'text='              + encodeURIComponent(incidentGr.comments.getHTMLValue());
				g_response.sendRedirect(targetURL);
        } else {
            gs.addErrorMessage( gs.getMessage('Incident not found for sys_id: {0}', sourceId));
        }
    } else if (isIncidentKcsPluginActive) {
        return true;
    }

    return shouldSkipInterceptorPage;
}

function getQueryAndPage(sourceTable, sourceId) {
	var input = {
				"sourceId": sourceId,
				"source": sourceTable,
				"target": "kb_knowledge" //for standard
				};
	var queryAndTable = new global.KBAjax().generateQueryAndTableNameFromSorceParam(input);
	return {
        "query": queryAndTable.query,
        "page": queryAndTable.tableName
    };
}

function buildPageParam( params, shouldSkipInterceptorPage, queryFromCSMtableMap, page) {
    var pageParam = '';
    var hasSysparmQuery = false;

    if (!g_request.getParameter('sysparm_stack') && page != 'kb_knowledge.do?') {
        pageParam += 'sysparm_stack=no';
    }

    while (params.hasMoreElements()) {
        var param = params.nextElement();
        var paramVal = g_request.getParameter(param);
        if (!paramVal) 
            continue;

        if (String(param) === 'sysparm_query') {
            hasSysparmQuery = true;

            if (shouldSkipInterceptorPage) {
                paramVal += '^' + queryFromCSMtableMap;
            }
            paramVal = validateQuery(paramVal);
        }
        if (pageParam === '')
                pageParam = param + '=' + paramVal;
            else
                pageParam = pageParam + '&' + param + '=' + paramVal;
    }

    if (!hasSysparmQuery && shouldSkipInterceptorPage) {
        pageParam = encodeURI(pageParam + "&sysparm_query=" + queryFromCSMtableMap);
    } else {
        pageParam = encodeURI(pageParam);
    }

    return pageParam;
}
