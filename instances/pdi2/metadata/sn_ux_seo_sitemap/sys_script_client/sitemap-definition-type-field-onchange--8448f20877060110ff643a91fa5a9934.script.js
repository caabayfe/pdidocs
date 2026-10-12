function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   
    switch (newValue) {
		// if Definition type is Static , show static xml field
        case 'static':
            showField('xml');
			hideField('script');
			hideField('table');
			hideField('query_condition');
			hideField('url_pattern');
            setDefaultValueForXMLType();
            break;
			
		// if Definition type is Table, show Table, Query condition, URL Pattern field
        case 'table':			
			showField('table');
			g_form.setDisplay('query_condition', true);
            hideField('xml');
			hideField('script');
			showField('url_pattern');
            break;
		
		// if Definition type is Script, show Script field
        case 'script':
            showField('script');
			hideField('query_condition');
            hideField('xml');
			hideField('table');
			hideField('url_pattern');
            setDefaultValueForScriptType();
            break;
    }
}

function hideField(fieldName){
	g_form.setMandatory(fieldName, false);
	g_form.setDisplay(fieldName, false);
}

function showField(fieldName){
	g_form.setMandatory(fieldName, true);
	g_form.setDisplay(fieldName, true);
}

function setDefaultValueForXMLType() {
    if (!g_form.getValue('xml')) {
        var defaultXMLValue = '<url>\n' +
            '<loc></loc>\n' +
            '<lastmod></lastmod>\n' +
            '<changefreq></changefreq>\n' +
            '</url>\n';
        g_form.setValue('xml', defaultXMLValue);
    }
}

function setDefaultValueForScriptType() {
    if (!g_form.getValue('script')) {
        var defaultValue = '/*\nfunction processSitemap() {\n    // Your sitemap generation code goes here.\n\n    // This is a sample response that ensures the generated XML is valid. Additional URL elements can be included.\n    var urlEntities = \'   <url>\\n\' +\n        \'      <loc>https://www.servicenow.com/</loc>\\n\' +\n        \'      <lastmod>2022-06-01</lastmod>\\n\' +\n        \'      <changefreq>monthly</changefreq>\\n\' +\n        \'   </url>\\n\';\n    return urlEntities;\n}\n\nprocessSitemap();\n\n//Validates that URLs included in the sitemap are public URLs and do not return a 301 redirect.\nfunction checkBrokenLink(url, callback) {\n    var xhr = new XMLHttpRequest();\n\n    xhr.onreadystatechange = function() {\n        if (xhr.readyState === 4) {\n            if (xhr.status < 300) {\n                // When checking a kb_view.do page, it returns a HTTP 200 response\n                // even if the page does not exist. Different logic is needed to check these pages.\n                if (/\\/kb_view\\.do/ig.test(url)) {\n                    if (/Undefined\\(jelly\\.jvar_obj\\.name;\\)/ig.test(xhr.responseText)) {\n                        return callback(false);\n                    }\n                }\n                return callback(true);\n            } else {\n                return callback(false);\n            }\n        }\n    };\n\n    if (/\\/kb_view\\.do/ig.test(url)) {\n        xhr.open(\"GET\", url);\n    } else {\n        xhr.open(\"HEAD\", url);\n    }\n    xhr.send();\n}\n\n// Sample code to get the human readable URL using the page record and the query string.\n// Get the page record with page route map using the pageId, portal sys_id and preventReRoute which is a boolean\n// value to prevent page re-routing. It should be false to get final routed page record.\nvar pageGR = global.SPSEOUtilsSNC.getPageRecordWithPageRoute(pageId, portalId, preventReRoute);\nvar hrURL = global.SPSEOUtilsSNC.getHumanReadableUrl(pageGR, queryString);\n\n// Note : \"If special characters <>&\"\' are used in the URL, then replace them with their equivalent escape characters.\"\n// Please refer the SEO script of the page record to ensure that the page does not have NOINDEX meta tag and also\n// to check if the URL has a canonical URL configured. If yes, that needs to be added to sitemap.\n*/';
        g_form.setValue('script', defaultValue);
    }
}
