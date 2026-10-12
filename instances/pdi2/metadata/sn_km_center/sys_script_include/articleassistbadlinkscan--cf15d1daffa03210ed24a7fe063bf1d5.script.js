var ArticleAssistBadLinkScan = Class.create();
ArticleAssistBadLinkScan.prototype = {

    type: 'ArticleAssistBadLinkScan',

    HOST_UNREACHABLE_ERROR: 1,
    RECORD_NOT_FOUND_ERROR: 2,
    KB_NOT_PUBLISHED_ERROR: 3,
    KB_EXPIRED_ERROR: 4,
    kbPages: [
        "esc_kb_article",
        "esc_kb_article_view",
        "kb_article_view",
        "kb_view",
        "kb_article",
        "kb_home",
        "kb_category",
        "mobile_kb_article",
        "alumni_kb_article",
        "kbox_article",
        "esm_kb_article",
        "it_kb_article",
        "redirect_to_kb_article",
        "knowledge_kb_article",
        "kb_knowledge",
    ],
    errorMap: {
        // --- 3xx: Redirection ---
        300: gs.getMessage("Multiple Choices"),
        301: gs.getMessage("Moved Permanently"),
        302: gs.getMessage("Found"),
        303: gs.getMessage("See Other"),
        304: gs.getMessage("Not Modified"),
        305: gs.getMessage("Use Proxy"),
        306: gs.getMessage("Switch Proxy"), // No longer used but listed for completeness
        307: gs.getMessage("Temporary Redirect"),
        308: gs.getMessage("Permanent Redirect"),

        // --- 4xx: Client Error ---
        400: gs.getMessage("Bad Request"),
        401: gs.getMessage("Unauthorized"),
        402: gs.getMessage("Payment Required"),
        403: gs.getMessage("Forbidden"),
        404: gs.getMessage("Not Found"),
        405: gs.getMessage("Method Not Allowed"),
        406: gs.getMessage("Not Acceptable"),
        407: gs.getMessage("Proxy Authentication Required"),
        408: gs.getMessage("Request Timeout"),
        409: gs.getMessage("Conflict"),
        410: gs.getMessage("Gone"),
        411: gs.getMessage("Length Required"),
        412: gs.getMessage("Precondition Failed"),
        414: gs.getMessage("URI Too Long"),
        415: gs.getMessage("Unsupported Media Type"),
        416: gs.getMessage("Range Not Satisfiable"),
        417: gs.getMessage("Expectation Failed"),
        422: gs.getMessage("Unprocessable Entity"),
        426: gs.getMessage("Upgrade Required"),

        // --- 5xx: Server Error ---
        500: gs.getMessage("Internal Server Error"),
        501: gs.getMessage("Not Implemented"),
        502: gs.getMessage("Bad Gateway"),
        503: gs.getMessage("Service Unavailable"),
        504: gs.getMessage("Gateway Timeout"),
    },
    customErrorMap: {
        1: gs.getMessage("Host unreachable"),
        2: gs.getMessage("Record not found"),
        3: gs.getMessage("KB not published"),
        4: gs.getMessage("KB expired"),
    },
	//DEF0886980: Ignore the following codes where
	//authentication is required for the link to work
	ignoreStatusCodes: [401, 403, 407],

    initialize: function(target, results, utils, err) {
        this.target = target;
        this.results = results;
        this.utils = utils;
		this.err = err;
        this.kbViewModel = new global.KBViewModel();
        this.kbContent = this.kbViewModel.getArticleContentBySysId(this.target.getUniqueValue());
        this.baseurl = gs.getProperty("glide.servlet.uri");
        this.tablesToScan = gs
            .getProperty(
                "glide.knowman.article_optimization.link_scan.table.allowlist",
                ""
            )
            .split(",");
    },

    getSysIdFromLink: function (link, tableName) {
        var kbSysIdRegEx = /(?:\b|%3[F6D])([a-zA-Z0-9]{32})(?:\b|%3[F6D])/gm;
        var regExSysId = kbSysIdRegEx.exec(link);
        if (regExSysId)
            return Array.isArray(regExSysId) ? regExSysId[1].trim() : regExSysId.trim();
        var shortSysIdRegEx = /sys_id(?:=|%3D)([a-zA-Z0-9]{3,32})/gm;
        regExSysId = shortSysIdRegEx.exec(link);
        if (regExSysId)
            return Array.isArray(regExSysId) ? regExSysId[1].trim() : regExSysId.trim();
        if (tableName) {
            var tableSysIdRegEx = new RegExp(`${tableName}/([a-zA-Z0-9]{3,32})`);
            regExSysId = tableSysIdRegEx.exec(link);
            if (regExSysId)
                return Array.isArray(regExSysId) ? regExSysId[1].trim() : regExSysId.trim();
        }
        return "";
    },

    getKBNumberFromLink: function (link) {
        var kbNumberRegEx = /(?:\b|%3[F6D])KB\d+(?:\b|%3[F6D])/;
        var regExKb = kbNumberRegEx.exec(link);
        if (!regExKb) return "";
        return Array.isArray(regExKb) ? regExKb[0].trim() : regExKb.trim();
    },

    getEmbeddedKbStatusCode: function (link) {
        var kbSysId = this.getSysIdFromLink(link, "kb_knowledge");
        var kbNumber = this.getKBNumberFromLink(link);
        if (kbSysId || kbNumber) {
            var gr = new GlideRecord("kb_knowledge");
            if (kbSysId) {
                gr.addQuery("sys_id", kbSysId);
            } else {
                gr.addQuery("number", kbNumber);
            }
            gr.query();

            // Check if any version of the record exists
            if (!gr.next()) {
                return this.RECORD_NOT_FOUND_ERROR;
            }

            //check for a published article
            var gr2 = new GlideRecord("kb_knowledge");
            if (kbSysId) {
                gr2.addQuery("sys_id", kbSysId);
            } else {
                gr2.addQuery("number", kbNumber);
            }
            gr2.addQuery("workflow_state", "published");
            gr2.query();

            //if published article is found, check that it hasn't expired
            if (gr2.next()) {
                var validTo = new Date(gr2.getValue("valid_to"));
                var beginningOfToday = new Date(gs.beginningOfToday().replace(' ', 'T'));
                if (validTo < beginningOfToday) {
                    return this.KB_EXPIRED_ERROR;
                }
                return 200;
            }
            return this.KB_NOT_PUBLISHED_ERROR;

        }
        // Not sure because we can't find a number or sysId for the record
        return 0;
    },

    getLinkHttpsStatus: function (link) {
        try {
            var request = new sn_ws.RESTMessageV2();
            request.setHttpMethod("GET");
            request.setHttpTimeout(10000);
            request.setEndpoint(encodeURI(link));

            var response = request.execute();
            var statusCode = response.getStatusCode();
            // When the host is unreachable ("statusCode" = 0) we return an error
            return statusCode === 0 ? this.HOST_UNREACHABLE_ERROR : statusCode;
        } catch (error) {
            gs.error("Failed to connect to " + link + ": " + error.message);
            return this.HOST_UNREACHABLE_ERROR;
        }
    },

    checkKbPage: function (link) {
        for (var i = 0; i < this.kbPages.length; i++) {
            if (link.contains(this.kbPages[i])) {
                return true;
            }
        }
        return false;
    },

    getAllowListTableInLink: function (link) {
        for (var i = 0; i < this.tablesToScan.length; i++) {
            var reg = new RegExp(
                "(?:\\b|%3[F6D])" + this.tablesToScan[i] + "(?:\\b|%3[F6D])"
            );
            if (reg.test(link)) {
                return this.tablesToScan[i];
            }
        }
        return false;
    },

    getSysIdStatus: function (table, sysId) {
        var grRecordStatus = new GlideRecord(table);
        return grRecordStatus.get(sysId) ? 200 : 1;
    },

    // Helper Functions
    isProtocolHttps: function (url) {
        return url.startsWith("https://");
    },

    getOrigin: function (url) {
        const urlParts = url.split("/");
        return urlParts[0];
    },

    isLocal: function (url) {
        const origin = this.getOrigin(url);
        const instanceOrigin = gs
            .getProperty("glide.servlet.uri")
            .replace(/\/$/, "");
        return (
            origin === instanceOrigin ||
            origin === "http://localhost" ||
            origin === "https://localhost" ||
            origin === "http://127.0.0.1" ||
            origin === "https://127.0.0.1"
        );
    },

    searchForBadLinks: function() {
        if (this.kbContent) {
			var xmlDoc = this.utils.parseHTMLIntoXML(this.kbContent, "xmlWrapper");
            if (xmlDoc == null) {
				this.err = "Error parsing HTML into XML";
				return;
			}

            var currentNode = xmlDoc.getFirstNode("//a");
            var totalLinks = 0;

            while (currentNode) {
                totalLinks++;
                var label = currentNode.getTextContent();
                var url = currentNode.getAttribute("href");

                if (!label) {
                    currentNode = xmlDoc.getNextNode(currentNode);
                    continue;
                }

                // The ECE editor converts local links to `../`
                // Security: Don't allow feature to be used to find files (file://) or other protocols
                if (!url.startsWith("https://") && !url.startsWith("http://") && !url.startsWith("/") && !url.startsWith("../")) {
                    currentNode = xmlDoc.getNextNode(currentNode);
                    continue;
                }
                // Security: Don't allow feature to be used as a port scanner
                if (url.match(/:\d+/) && !url.match(/:\d+/)[0].match(/:(80|8080)/)) {
                    currentNode = xmlDoc.getNextNode(currentNode);
                    continue;
                }

                var statusCode = 0;
                // Local link
                if (url.startsWith("/") || url.startsWith(this.baseurl) || url.startsWith("../")) {
                    var tableToCheck = this.getAllowListTableInLink(url);
                    // Internal Links
                    if (this.checkKbPage(url)) {
                        var statusCode = this.getEmbeddedKbStatusCode(url);
                    } else if (tableToCheck) {
                        var sysId = this.getSysIdFromLink(url, tableToCheck);
                        if (sysId) {
                            statusCode = this.getSysIdStatus(tableToCheck, sysId);
                        }
                    }
                } else if ((this.isProtocolHttps(url) || url.startsWith("http://")) && !this.isLocal(url)) {
                    // External Links
                    statusCode = this.getLinkHttpsStatus(url);
                }

                // We are considering status code 1 to be a generic error. Usually means we couldn't find the GildeRecord.
                if (
                    statusCode &&
                    ((statusCode > 299 && !this.ignoreStatusCodes.includes(statusCode)) || !!this.customErrorMap[statusCode])
                ) {
                    var message = "";
                    if (statusCode && this.errorMap[statusCode]) {
                        message = gs.getMessage(
                            "Link is not working correctly - {0}: {1}. Confirm that link URL is complete and correct and that page is still reachable.",
                            [statusCode, this.errorMap[statusCode]]
                        );
                    } else if (!!this.customErrorMap[statusCode]) {
                        message = gs.getMessage(
                            "Link is not working correctly - {0}: Confirm that link URL is complete and correct and that page is still reachable.",
                            [this.customErrorMap[statusCode]]
                        );
                    } else {
                        message = gs.getMessage(
                            "Link is not working correctly - Confirm that link URL is complete and correct and that page is still reachable."
                        );
                    }
                    var result = this.utils.createOpenResult(
                        message,
                        "article",
                        currentNode.toString()
                    );
                    result.href = url; // Currently set url
                    result.cssSelector = "a[href=\""+url+"\"]";

                    if (statusCode > 299) {
                        result.name = statusCode + ": " + label;
                    } else if (statusCode && this.customErrorMap[statusCode]) {
                        result.name = this.customErrorMap[statusCode] + ": " + label;
                    } else {
                        result.name = label;
                    }

                    currentNode.setAttribute("href", "{{href}}");

                    result.recommendation = currentNode.toString();

                    this.results.push(result);
                }

                currentNode = xmlDoc.getNextNode(currentNode);
            }
            // Store the total link count on every result so the score denominator
            // is available regardless of which findings are later ignored or removed
            // (the ignore-time recompute reads it from any surviving row).
            for (var ti = 0; ti < this.results.length; ti++) {
                this.results[ti].totalNumber = totalLinks;
            }
        }
    }
};
