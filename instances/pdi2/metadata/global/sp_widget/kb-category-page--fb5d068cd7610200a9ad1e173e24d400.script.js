// populate the 'data' variable
if (input)
	data.category = input.category;
else
	data.category = $sp.getParameter("kb_category");

var kbIds = $sp.getKnowledgeBases();
var kbs = kbIds.split(',');
data.kmSearchOrder = gs.getProperty("glide.service_portal.honor.knowman.search.order", "false");
data.KbArticlesSortBy = gs.getProperty("glide.knowman.order.search", "relevancy");

data.limit = parseInt(options.limit_article) || 10;

if (input && input.new_limit)
    data.limit = input.new_limit;

var kb_cat = new GlideRecord("kb_category");
data.categoryDisplay = gs.getMessage("Select a category");
data.items = [];
data.categoryExists = false;
if (kb_cat.get(data.category)) {
  data.categoryExists = true;
  data.categoryDisplay = kb_cat.getDisplayValue();
  data.items = getKBCategoryArticleSummaries();
}

var diff = data.items.length - data.limit;
if (diff <= 0)
    data.showMore = false;
else {
	data.items.splice(data.limit);
	data.showMore = true;
}
data.show_msg = gs.getMessage("Showing {0} items", data.limit + "");

var kbId = $sp.getParameter('kb_id');

data.kbId = kbId;

if (kbId) {
	var gr = new GlideRecord("kb_knowledge_base");
	if (gr.get(kbId))
		data.kbName = gr.getDisplayValue("title");
}

data.kb_knowledge_page = $sp.getDisplayValue("kb_knowledge_page") || "kb_view";

data.breadcrumbs = [{label: data.categoryDisplay, url: '#'}];
if (kb_cat.parent_id) {
    var rec = kb_cat.parent_id.getRefRecord();
    while (rec.getRecordClassName() == "kb_category") {
        if (kbId)
            data.breadcrumbs.unshift({label: rec.getDisplayValue(), url: '?id=kb_category&kb_category=' + rec.getUniqueValue() + '&kb_id='+ kbId});
        else
            data.breadcrumbs.unshift({label: rec.getDisplayValue(), url: '?id=kb_category&kb_category=' + rec.getUniqueValue()});
        rec = rec.parent_id.getRefRecord();
    }
}

if (kbs && kbs.length > 1) {
	if (kbId)
		data.breadcrumbs.unshift({label: data.kbName, url: '?id=' + data.kb_knowledge_page + '&kb_id='+ kbId});
	data.breadcrumbs.unshift({label: gs.getMessage("All Knowledge Bases"), url: '?id=' + data.kb_knowledge_page});
} else
	data.breadcrumbs.unshift({label: gs.getMessage("Knowledge Base"), url: '?id=' + data.kb_knowledge_page});

data.showStarRating = showStarRating();

function getKBCategoryArticleSummaries() {
    var kbSortObj = {
        "views": "sys_view_count",
        "relevancy": "relevancy",
        "sys_updated_on": "sys_updated_on"
    };
    var kbFields = "sys_view_count,author,rating,sys_updated_on,sys_id";
    var obj = {
        keyword: '',
        start: '0',
        end: data.limit + 1,
        language: '',
        variables: {
            'kb_category': [data.category],
            'kb_knowledge_base': kbs
        },
        knowledge_fields: kbFields,
        social_fields: '',
        category_as_tree: true,
        attachment: false,
        resources: '',
        order_desc: true
    };

    if (data.kmSearchOrder)
        obj.order = kbSortObj[data["KbArticlesSortBy"]] + ',' + obj.order_desc;

    var resultDataList = (new KBPortalServiceImpl().getResultData(obj)).results || [];
    var kbFieldsList = kbFields.split(',');
    if (resultDataList.length > 0) {
        resultDataList.map(function(resultData) {
            if (resultData.meta) {
                for (var i = 0; i < kbFieldsList.length; i++)
                    resultData[kbFieldsList[i]] = resultData.meta[kbFieldsList[i]] ? resultData.meta[kbFieldsList[i]].display_value : '';
            }
            if (resultData.snippet)
                resultData.text = resultData.snippet;

        });
    }
    return resultDataList;
}

function showStarRating() {
	if (options.show_star_rating == "Yes")
		return true;

	if (options.show_star_rating == "No")
		return false;

	// check gating property for all rating options
	if (gs.getProperty("glide.knowman.show_rating_options", "true") != "true")
		return false;

	// does user have the right role?
	if (!gs.hasRole(gs.getProperty("glide.knowman.show_rating_options.roles")))
		return false;

	// check specific property for stars
	if (gs.getProperty("glide.knowman.show_star_rating", "true") != "true")
		return false;

	// does user have the right role?
	return gs.hasRole(gs.getProperty("glide.knowman.show_star_rating.roles"));
}
