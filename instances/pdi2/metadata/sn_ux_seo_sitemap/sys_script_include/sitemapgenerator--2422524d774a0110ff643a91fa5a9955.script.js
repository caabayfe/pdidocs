var SitemapGenerator = Class.create();
SitemapGenerator.prototype = Object.extendsObject(global.SPSEOUtilsSNC, {
    initialize: function() {
        this.portalURLSuffixList = [];
    },
    generateSitemap: function(sitemapConfigId) {
        var sitemapConfigName = "";
        try {
            if (sitemapConfigId == '') {
                gs.error(gs.getMessage('Missing Sitemap ConfigId.'));
                gs.addErrorMessage(gs.getMessage('Missing Sitemap ConfigId.'));
            } else {
                var sitemapConfig = new GlideRecord('sys_ux_seo_sitemap_config');

                if (!sitemapConfig.get(sitemapConfigId)) {
                    // if sitemap does not exists, log an error
                    gs.error(gs.getMessage('Invalid Sitemap ConfigId'));
                    gs.addErrorMessage(gs.getMessage('Invalid Sitemap ConfigId.'));
                } else {
                    // Retrieve active sitemap config definitions only when the sitemap configuration is active 
                    if (!sitemapConfig.active) {
                        gs.info(gs.getMessage('Sitemap Configuration {0} is not active .', sitemapConfig.name));
                        gs.addInfoMessage(gs.getMessage('Sitemap Configuration {0} is not active .', sitemapConfig.name));
                    } else {
                        sitemapConfigName = sitemapConfig.name;

                        var sitemapDefinition = new GlideRecord('sys_ux_sitemap_definition');
                        sitemapDefinition.addQuery('sitemap_config', sitemapConfig.sys_id);
                        sitemapDefinition.addQuery('active', 'true');
                        sitemapDefinition.query();

                        if (sitemapDefinition.hasNext()) {
                            var content = "";
                            var isXMLContentValid = null;
                            var invalidXMLCount = 0;

                            while (sitemapDefinition.next()) {
                                // logic for different definition types - table/script/static
                                if (sitemapDefinition.type == 'static') {
                                    content += sitemapDefinition.xml;
                                } else if (sitemapDefinition.type == 'script') {
                                    if (gs.nil(sitemapDefinition.script)) {
                                        continue;
                                    }
                                    var contentFromScriptType = this.executeScript(sitemapDefinition);
                                    isXMLContentValid = this.validateXML(contentFromScriptType);
                                    // The object `isXMLContentValid` returns null when the xml string is valid
                                    if (!gs.nil(isXMLContentValid)) {
                                        invalidXMLCount += 1;
                                        gs.addErrorMessage(gs.getMessage('Invalid xml for Script type. Please resolve the errors.'));
                                        gs.info(gs.getMessage('Invalid xml for Script type. Please resolve the errors: {0}', isXMLContentValid));
                                        continue;
                                    }
                                    content += this.executeScript(sitemapDefinition);
                                } else if (sitemapDefinition.type == 'table') {
                                    var contentFromTable = this.buildSitemapXMLContent(sitemapConfig, sitemapDefinition);
                                    isXMLContentValid = this.validateXML(contentFromTable);
                                    if (!gs.nil(isXMLContentValid)) {
                                        invalidXMLCount += 1;
                                        gs.info(gs.getMessage('Invalid xml for Table type. Please resolve the errors:  {0}', isXMLContentValid));
                                        continue;
                                    }
                                    content += this.buildSitemapXMLContent(sitemapConfig, sitemapDefinition);
                                }
                            }

                            // if the count is = 0, only then paginate the content
                            if (invalidXMLCount == 0) {
                                // iterate over all URLs and include only public URLs in the final sitemap
                                content = this.getPublicURLs(content);
                                // performs pagination with set record limit
                                var fileContent = this.paginate(content);
                                this.writeXMLAsAttachment(sitemapConfig, fileContent);
                            } else {
                                // this function deletes existing attachments, if any
                                var sysAttachment = new GlideSysAttachment();
                                this.deleteAttachments(sitemapConfig, sysAttachment);
                                gs.error(gs.getMessage('There are invalid sitemap definitions. Please resolve the errors.'));
                            }
                        } else {
                            gs.addInfoMessage(gs.getMessage('No active sitemap definitions found for {0}', sitemapConfig.name));
                            gs.info(gs.getMessage('No active sitemap definitions found for {0}', sitemapConfig.name));
                        }
                    }
                }
            }
        } catch (error) {
            gs.addErrorMessage(gs.getMessage('Unable to generate sitemap. Please check the logs for further information.'));
            gs.error('{0}: {1} {2}', sitemapConfigName, gs.getMessage('Unable to generate sitemap --- '), error);
        }
    },
    getUrlParams: function(urlString) {
        var urlParts = urlString.split('?');
        var urlPreQP = urlParts[0];
        var urlQP = urlParts[1];

        var queryParams = [];
        urlQP.split('&').forEach(function(splitStr) {
            var pair = splitStr.split('=');
            queryParams.push({
                key: pair[0],
                value: pair[1]
            });
        });
        return {
            'urlPreQP': urlPreQP,
            'queryParams': queryParams
        };
    },
    appendContentWithHeaderAndFooter: function(content) {
        var sitemapXMLHeader =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
            '		xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"\n' +
            '		xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
            '		xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
        var sitemapXMLFooter = '\n</urlset>\n';
        return sitemapXMLHeader + content + sitemapXMLFooter;
    },
    buildSitemapXMLContent: function(sitemapConfig, sitemapDefinition) {
        var URL_PARAM_DELIM_DOT = '.';
        var URL_PARAM_DELIM_QUESTION = '?';
        var URL_PARAM_DELIM_AMPERSAND = '&amp;';
        var URL_PARAM_DELIM_EQUAL = '=';

        var baseUrl = gs.getProperty("glide.servlet.uri");
        if (baseUrl)
            baseUrl = baseUrl.slice(0, -1);

        if (sitemapConfig && sitemapConfig.url_prefix)
            baseUrl = sitemapConfig.url_prefix;

        // this function shall handle table type of sitemap content generation
        var tableName = sitemapDefinition.table;
        var queryCondition = sitemapDefinition.query_condition;
        var urlPattern = sitemapDefinition.url_pattern;

        var getQP = this.getUrlParams(urlPattern);
        var queryParams = getQP.queryParams;
        var urlPreQP = getQP.urlPreQP;
        var queryColumns = [];

        var queryGR = new GlideRecord(tableName);
        queryGR.addEncodedQuery(queryCondition);

        queryGR.query();

        var content = '';
        while (queryGR.next()) {
            var locationStr = baseUrl + urlPreQP;
            var firstParam = true;
            queryParams.forEach(function(queryParam) {
                if (firstParam)
                    locationStr += URL_PARAM_DELIM_QUESTION;
                else
                    locationStr += URL_PARAM_DELIM_AMPERSAND;
                firstParam = false;
                var key = queryParam.key;
                var value = queryParam.value;
                if (value.startsWith(tableName + URL_PARAM_DELIM_DOT)) {
                    value = queryGR.getValue(value.substring(value.indexOf(URL_PARAM_DELIM_DOT) + 1));
                }
                locationStr += key + URL_PARAM_DELIM_EQUAL + value;
            });
            var dateTime = new GlideDateTime(queryGR.sys_updated_on);
            content += '   <url>\n' +
                '      <loc>' + locationStr + '</loc>\n' +
                '      <lastmod>' + dateTime.getDate() + '</lastmod>\n' +
                '   </url>\n';

        }
        return content;
    },
    writeXMLAsAttachment: function(sitemapConfig, content) {
        // this function persists the sitemap xml content as an attachment with sitemapConfig reference

        // this function deletes existing attachments, if any
        var sysAttachment = new GlideSysAttachment();
        this.deleteAttachments(sitemapConfig, sysAttachment);

        // writing content to the attachment glide record
        var pages = content.length;
        var contentType = 'text/xml';
        var fileName = "";
        var attachmentGlideRecord = "";
        var fileContent = "";
        if (pages == 1) {
            // if there is a single sitemap file , generate a file with name 'sitemap-{sitemapConfigId}'
            fileName = 'sitemap-' + sitemapConfig.sys_id + '.xml';
            fileContent = this.appendContentWithHeaderAndFooter(content[0]);
            attachmentGlideRecord = sysAttachment.write(sitemapConfig, fileName, contentType, fileContent);
        } else if (pages > 1) {
            for (var i = 0; i < pages; i++) {
                // if there are more than 1 sitemap xml pages , generate a file with name 'sitemap-{pageNo}-{sitemapConfigId}'
                fileName = 'sitemap-' + (i + 1) + '-' + sitemapConfig.sys_id + '.xml';
                fileContent = this.appendContentWithHeaderAndFooter(content[i]);
                attachmentGlideRecord = sysAttachment.write(sitemapConfig, fileName, contentType, fileContent);
            }
            // create index file for the paginated sitemap files with file name - 'sitemap-{sitemapConfigId}'
            this.generateIndexFile(sitemapConfig);
        }

        if(content.length >= 1) {
            gs.addInfoMessage(gs.getMessage('Sitemap XML generated successfully.'));
            gs.info('{0}: {1}', sitemapConfig.name, gs.getMessage('Sitemap XML generated successfully.'));
        } else {
            gs.addErrorMessage(gs.getMessage('No public URLs found to generate Sitemap.'));
            gs.error(gs.getMessage('No public URLs found to generate Sitemap.'));
        }
    },
    generateIndexFile: function(sitemapConfig) {
        var pageNo = "";
        var locationStr = "";
        var xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        var xmlFooter = '</sitemapindex>';
        var fileContent = "";
        var fileName = "";
        var contentType = 'text/xml';
        var indexFileName = 'sitemap-' + sitemapConfig.sys_id + '.xml';

        var baseUrl = gs.getProperty("glide.servlet.uri");
        if (baseUrl)
            baseUrl = baseUrl.slice(0, -1);

        var sysAttachment = new GlideSysAttachment();
        var sitemapAttachments = sysAttachment.getAttachments('sys_ux_seo_sitemap_config', sitemapConfig.sys_id);

        while (sitemapAttachments.next()) {

            // get the page number from file name, "sitemap-{pageNo}-{sitemapConfigId}"
            fileName = sitemapAttachments.getValue('file_name');
            pageNo = fileName.split('-')[1];
            locationStr = baseUrl + '/sitemap.do?sitemapConfigId=' + sitemapConfig.sys_id + '&amp;pageNo=' + pageNo;
            var dateTime = new GlideDateTime(sitemapAttachments.sys_updated_on);

            fileContent += '   <sitemap>\n' +
                '      <loc>' + locationStr + '</loc>\n' +
                '      <lastmod>' + dateTime.getDate() + '</lastmod>\n' +
                '   </sitemap>\n';
        }

        // append header and footer to the xml content
        fileContent = xmlHeader + fileContent + xmlFooter;

        //write the content to index file attachment 
        var attachmentGlideRecord = sysAttachment.write(sitemapConfig, indexFileName, contentType, fileContent);
        gs.info('{0}: {1}', sitemapConfig.name, gs.getMessage('Sitemap index file generated successfully.'));
    },
    getSiteMapPageCount: function() {
        var MIN_PAGE_COUNT = 1;
        var MAX_PAGE_COUNT = 5000;
        var DEFAULT_PAGE_COUNT = 750;
        var pageCount = gs.getProperty("glide.sitemap.page.count", DEFAULT_PAGE_COUNT);
        // if the rowCount vaue doesn't fall under the given range, then set the default value
        if (pageCount < MIN_PAGE_COUNT || pageCount > MAX_PAGE_COUNT) {
            pageCount = DEFAULT_PAGE_COUNT;
        }
        return pageCount;
    },
    paginate: function(content) {

        // sets the record limit for pagination 
        var rowCount = this.getSiteMapPageCount();
        var fileContent = [];
        var xmlContent = "";
        var recordCount = 0;
        var iterNext;

        content = '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">' + content + '</urlset>';

        // Use the `XMLDocument2()` JavaScript Object wrapper for parsing and extracting XML data from an XML string.
        var xmlParser = new XMLDocument2();
        xmlParser.parseXML(content);
        var recordList = xmlParser.getNode("urlset");
        var iter = recordList.getChildNodeIterator();

        // Iterating over the content to count the records and fetch the value
        while (iter.hasNext()) {
            iterNext = iter.next();
            if (iterNext.getNodeName() == 'url') {
                recordCount++;

                // When the `recordCount` is greater than limit , reset the xmlContent and recordCount to push the content to the new file 
                if (recordCount > rowCount) {
                    fileContent.push(xmlContent);
                    xmlContent = "";
                    recordCount = 1;
                }
                xmlContent += iterNext.toString() + '\n';
            }
        }
        // check if there are any url records left. If yes , add them to a new file
        if (recordCount > 0 && !gs.nil(xmlContent)) {
            fileContent.push(xmlContent);
        }
        return fileContent;

    },
    validateXML: function(content) {
        // validate the generated xml string content using GlideXMLUtil API
        return GlideXMLUtil.validateXML(content, false, true);
    },
    deleteAttachments: function(sitemapConfig, sysAttachment) {
        // check if an attachment exists, if yes delete it
        var existingAttachments = sysAttachment.getAttachments('sys_ux_seo_sitemap_config', sitemapConfig.sys_id);
        while (existingAttachments.next()) {
            sysAttachment.deleteAttachment(existingAttachments.sys_id);
        }
    },
    populatePortalURLs: function() {
        var portalRecord = new GlideRecord('sp_portal');
        portalRecord.query();
        while (portalRecord.next()) {
            var record = portalRecord;
            this.portalURLSuffixList.push(record.getValue('url_suffix'));
        }
    },
    getPublicURLs: function(content) {
        content = '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">' + content + '</urlset>';
        var xmlParser = new XMLDocument2();
        xmlParser.parseXML(content);
        var urlNodesList = xmlParser.getNode("urlset");
        var urlIterator = urlNodesList.getChildNodeIterator();
        var finalContent = "";
        var urlNodeElement, urlString;
        var pageDetailsMap = {};
        this.populatePortalURLs();
        while (urlIterator.hasNext()) {
            urlNodeElement = urlIterator.next();
            urlString = "";
            if (urlNodeElement.getNodeName() === 'url') {
                // check if the url has <loc> node
                var urlChildNodesIterator = urlNodeElement.getChildNodeIterator();
                var isEmptylocNode;
                while (urlChildNodesIterator.hasNext()) {
                    var childNode = urlChildNodesIterator.next();
                    if (childNode.getNodeName() === 'loc') {
                        isEmptylocNode = childNode.getTextContent() ? false : true;
                        urlString = childNode.getTextContent();
                        break;
                    }
                }
                if (!urlString) {
                    urlString = urlNodeElement.getTextContent();
                }
                if (isEmptylocNode || !urlString) {
                    continue;
                }
                var urlDetails = this.processURL(urlString);

                if (urlDetails.isBaseUrl) {
                    continue;
                } else if (urlDetails.urlType === 'custom' || urlDetails.urlType === 'platform' || urlDetails.isPortalLanding) {
                    finalContent += urlNodeElement.toString() + '\n';
                } else {
                    var pageDetails;
                    // check if the page and the portal combination already exists in the pageDetails map
                    if (this.isPageExists(pageDetailsMap, urlDetails)) {
                        pageDetails = pageDetailsMap[urlDetails.queryParams.id][urlDetails.portalURL];
                    } else {
                        pageDetails = this.getFinalRoutedPageDetails(urlDetails);
                        if (!pageDetails) {
                            continue;
                        }
                        pageDetailsMap[urlDetails.queryParams.id] = {};
                        pageDetailsMap[urlDetails.queryParams.id][urlDetails.portalURL] = pageDetails;
                    }
                    if (pageDetails.isPageNotFound) {
                        continue;
                    } else if (pageDetails.isPublicPage) {
                        finalContent += urlNodeElement.toString() + '\n';
                    } else {
                        gs.info(gs.getMessage('The given URL {0} is not public', urlString));
                    }
                }
            }
        }
        return finalContent;
    },
    isPageExists: function(pageDetailsMap, urlDetails) {
        return (pageDetailsMap[urlDetails.queryParams.id] && pageDetailsMap[urlDetails.queryParams.id][urlDetails.portalURL]);
    },
    isInternalURL: function(url) {
        var baseURL = gs.getProperty("glide.servlet.uri");
        return (url.indexOf(baseURL) == 0);
    },
    getURLDetails: function(url) {
        var pageDetails = {};
        var baseURL = gs.getProperty("glide.servlet.uri");
        if (url == baseURL) {
            pageDetails.isBaseUrl = true;
            return pageDetails;
        }
        var pageValues = url.split(baseURL);
        var pageURL = pageValues[1];
        var urlInfo = pageURL.split('?');
        pageDetails['portalURL'] = urlInfo[0].split('/')[0];
        var queryParams = {};
        if (urlInfo.length > 1) {
            var urlParams = urlInfo[1].split('&');
            queryParams = urlParams.reduce(function(acc, param) {
                var paramDetails = param.split('=');
                if (paramDetails.length > 1) {
                    acc[paramDetails[0]] = paramDetails[1];
                }
                return acc;
            }, {});
        }
        pageDetails.queryParams = queryParams;
        pageDetails.url = url;
        return pageDetails;
    },
    processURL: function(url) {
        var urlDetails = {};
        if (this.isInternalURL(url)) {
            urlDetails = this.getURLDetails(url);
            // check if it is a platform url
            if (!urlDetails.isBaseUrl && this.isPlatformURL(urlDetails)) {
                urlDetails.urlType = 'platform';
            } else if (!urlDetails.isBaseUrl && !urlDetails.queryParams.id) {
                urlDetails.urlType = 'portal';
                urlDetails.isPortalLanding = true;
            }
        } else {
            // TO DO: process the custom url
            urlDetails.urlType = 'custom';
        }
        return urlDetails;
    },
    isPlatformURL: function(urlDetails) {
        return (this.portalURLSuffixList.indexOf(urlDetails.portalURL) == -1);
    },
    getFinalRoutedPageDetails: function(urlDetails) {
        // get the portal details
        var portalRecord = this.getPortalDetails(urlDetails.portalURL);
        if (!portalRecord) {
            return null;
        }
        // get the page route map details 
        var routedPage = global.SPSEOUtilsSNC.getPageRecordWithPageRoute(urlDetails.queryParams.id, portalRecord.sys_id, false);
        // In case of invalid page ids, check if the routed page is pointing to the 404 page of the portal
        if (routedPage.sys_id == portalRecord.notfound_page) {
            urlDetails.isPageNotFound = true;
        } else {
            urlDetails.urlType = 'portal';
            urlDetails.isPublicPage = routedPage.public;
        }
        return urlDetails;
    },
    getPortalDetails: function(portalURL) {
        var portalRecord = new GlideRecord('sp_portal');
        portalRecord.addQuery('url_suffix', portalURL);
        portalRecord.query();
        if (portalRecord.hasNext()) {
            portalRecord.next();
            return portalRecord;
        } else {
            return null;
        }
    },
    executeScript: function(sitemapDefinition) {
        try {
            // execute script from sitemap definition 'script' field
            var evaluator = new GlideScopedEvaluator();
            return evaluator.evaluateScript(sitemapDefinition, 'script', null);
        } catch (error) {
            gs.error('{0} {1}', gs.getMessage('Unable to execute the script: '), error);
        }
    },

    type: 'SitemapGenerator'
});
