var ArticleAssistUtils = Class.create();
ArticleAssistUtils.prototype = {
    SCHEDULED_JOB_CONFIGURATION: "sysauto_kb_assist_job",
    SCAN_DEFINITION: "kb_assist_scan_definition",
    SCAN_DEFINITION_INPUT: "kb_assist_scan_definition_input",
    JOB_M2M_SCAN: "kb_assist_job_m2m_scan",
    SCAN_RESULT: "kb_assist_scan_result",
    ARTICLE_OPTIMIZATION_CAPABILITY_ID: "900cfe97ff7322104ade90e0653bf1b1",
    ARTICLE_OPTIMIZATION_SKILL_CONFIG_ID: "680cfe97ff7322104ade90e0653bf1de",

    initialize: function() {},

    // deletes all previous ignored and open results if there are no results from 
    // the latest run 
    closeAllPreviousResults: function(definitionGr, targetGr) {
        var existingGr = new GlideRecordSecure(this.SCAN_RESULT);
        existingGr.addQuery("scan_definition", definitionGr.sys_id);
        existingGr.addQuery("target_record", targetGr.sys_id);
        existingGr.query();
        //DEF0845281: Need to use deleteRecord instead of deleteMultiple as ACL gets skipped
        while (existingGr.next()) {
            existingGr.deleteRecord();
        }
    },

    // gets all previous results that are still open or ignored, and closes any outdated ones
    // to prepare for new ones getting created. Returns results that still apply.
    cleanupPreviousResults: function(definitionGr, targetGr, results, healthScore) {
        var existingResults = {};
        // Results are compared by exact JSON string equality, but AI-generated
        // scans (e.g. reading ease) re-produce recommendation text with different whitespace
        // formatting on every run even when the finding itself is unchanged. Normalize
        // whitespace when building the comparison key so those runs still match the
        // previous result instead of deleting it and creating a duplicate "new" one.
        var normalizedResults = results.map(result => this.normalizeResultKey(result));
        var previousResultsGr = new GlideRecordSecure(this.SCAN_RESULT);
        previousResultsGr.addQuery("scan_definition", definitionGr.sys_id);
        previousResultsGr.addQuery("target_record", targetGr.sys_id);
        previousResultsGr.query();
        while (previousResultsGr.next()) {
            var previousResult = this.normalizeResultKey(previousResultsGr.getValue('result'));
            // delete previous result when no issues were found
            if (previousResultsGr.getValue("state") == "closed") {
                previousResultsGr.deleteRecord();
                // close any result that no longer applies
            } else if (normalizedResults.indexOf(previousResult) === -1) {
                previousResultsGr.deleteRecord();
            } else if (existingResults[previousResult]) {
                // Duplicate of an open result already kept this run: delete the extra
                // copy so duplicate rows can't inflate the open-result count (N).
                previousResultsGr.deleteRecord();
            } else {
                existingResults[previousResult] = true;
                // Refresh the kept result's health score to this run's value so the article
                // score reflects the current cluster size even when the result set is unchanged
                // (otherwise the kept result keeps its stale health_score).
                if (healthScore >= 0 && previousResultsGr.getValue('health_score') != ('' + healthScore)) {
                    previousResultsGr.setValue('health_score', healthScore);
                    previousResultsGr.update();
                }
            }
        }
        return existingResults;
    },

    // Whitespace-tolerant comparison key for scan result de-duplication.
    // Collapses runs of whitespace so results whose text differs only in formatting
    // (e.g. LLM-introduced line breaks/indentation) are treated as the same result.
    // Guards against non-string input (e.g. a legacy/error-state record whose stored
    // "result" value isn't a JSON string) so a single malformed record can't throw and
    // abort the whole scan run.
    normalizeResultKey: function(resultJson) {
        return (typeof resultJson === 'string' ? resultJson : '').replace(/\s+/g, ' ');
    },

    // this grab a result from the last scan that was run on the target record 
    // to determine whether the result is before or after the last record update
    getLastResultDate: function(definitionGr, targetGr) {
        var existingGr = new GlideRecordSecure(this.SCAN_RESULT);
        existingGr.addQuery("scan_definition", definitionGr.sys_id);
        existingGr.addQuery("target_record", targetGr.sys_id);
        existingGr.orderByDesc('sys_created_on');
        existingGr.setLimit(1);
        existingGr.query();
        if (existingGr.next()) return new GlideDateTime(existingGr.getValue('sys_created_on'));
        return null;
    },

    //Creates an object if a result was found
    createOpenResult: function(message, field, identifier) {
        return {
            state: "open",
            message,
            field,
            identifier
        };
    },

    //Creates an object if no result was found
    createClosedResult: function(message) {
        return {
            state: "closed",
            message
        };
    },

    isKnowledge: function(targetGr) {
        if (targetGr.getTableName() === "kb_knowledge" || targetGr.sys_class_name === "kb_knowledge") {
            return true;
        }

        var tableHierarchy = new GlideTableHierarchy(targetGr.sys_class_name);
        return tableHierarchy.getTables().includes("kb_knowledge");
    },

    isLatestOrPublished: function(targetGr) {
        //if versioning is installed and active check if article is latest or published
        var kbKnowledge = new global.KBKnowledge();
        if (kbKnowledge.isVersioningInstalled() && kbKnowledge.isVersioningEnabled()) {
            return (targetGr.latest.nil() || targetGr.latest || targetGr.workflow_state == "published");
        }

        //if not, return true
        return true;
    },

    isAoSkillEnabled: function() {
        // Check capability is enabled
        var gr = new GlideRecord("sn_nowassist_skill_config_status");
        gr.addQuery("skill_config", this.ARTICLE_OPTIMIZATION_SKILL_CONFIG_ID);
        gr.addQuery("active", true);
        gr.query();
        if (gr.next()) {
            return true;
        }
        return false;
    },

    canRunScan: function(definitionGr) {
        var executionType = definitionGr.getValue('execution_type');
        if (executionType === 'script' || this.isAoSkillEnabled()) {
            return true;
        }

        //Only run attachment summarizer if Ao skill is enabled
        if (executionType === 'scripted_ai') {
            return false;
        }

        //verfiy capability is part of AO Skill and not custom
        if (this.getCapabilityId(definitionGr.getValue('ai_config')) == this.ARTICLE_OPTIMIZATION_CAPABILITY_ID) {
            return false;
        }

        return true;
    },

    getCapabilityId: function(skillId) {
        //using GlideRecord as knowledge author may not have access to Gen AI tables
        var aiConfigGr = new GlideRecord("sys_generative_ai_config");
        if (aiConfigGr.get(skillId)) {
            var skillDefinitionGr = new GlideRecord(aiConfigGr.getValue("definition_table"));
            if (skillDefinitionGr.get(aiConfigGr.getValue("definition"))) {
                return skillDefinitionGr.getValue("capability");
            }
        }

        return -1;
    },

    runScan: function(configurationId) {
        //Check if knowledge center is enabled in order to run Article Optimization
        if (gs.getProperty("sn_km_center.glide.knowman.enable", "false") == "false") {
            gs.info(gs.getMessage("Article Optimization will not run because Knowledge Center has been disabled."));
            return;
        }

        //Get Configuration Record
        var configurationGr = new GlideRecordSecure(this.SCHEDULED_JOB_CONFIGURATION);
        if (configurationGr.get(configurationId)) {

            //get scans for the job
            var definitionOrdersGr = new GlideRecordSecure(this.JOB_M2M_SCAN);
            definitionOrdersGr.addQuery("kb_assist_job", configurationId);
            definitionOrdersGr.query();

            //want to apply licensing if just one of our AO skills are used
            let usage = false;
            while (definitionOrdersGr.next()) {

                var definitionGr = new GlideRecordSecure(this.SCAN_DEFINITION);
                if (definitionGr.get(definitionOrdersGr.getValue("scan_definition"))) {
                    if (!this.canRunScan(definitionGr)) {
                        gs.error("Article Optimization scan definition \"" + definitionGr.getDisplayValue('name') + "\" did not run because a required skill is not enabled.");
                        continue;
                    }

                    var runType = definitionGr.getValue('run_type');
                    var executionType = definitionGr.getValue('execution_type');

                    //get records to run scans on
                    var queryTable = configurationGr.getValue("query_table");
                    var queryConditions = configurationGr.getValue("query_conditions");

                    var targetGr = new GlideRecordSecure(queryTable);
                    if (queryConditions != null) targetGr.addEncodedQuery(queryConditions, true);
                    targetGr.query();

                    //Check to use licensing
                    if (targetGr.hasNext()) {
                        if ((executionType == "skill" && this.getCapabilityId(definitionGr.getValue('ai_config')) == this.ARTICLE_OPTIMIZATION_CAPABILITY_ID) || executionType === 'scripted_ai') {

                            if (!usage) {
                                sn_one_extend.GenerativeAIUtility.logGenAIUsage("MANUAL", this.ARTICLE_OPTIMIZATION_CAPABILITY_ID, "sn_nowassist_skill_config", this.ARTICLE_OPTIMIZATION_CAPABILITY_ID);
                                usage = true;
                            }
                        }
                    }

                    while (targetGr.next()) {
                        // making sure to not run the scan on records that have not changed since the last result 
                        // if the run type is "onchange"
                        if (runType === "onchange") {
                            var targetUpdateDate = new GlideDateTime(targetGr.getValue('sys_updated_on'));
                            var lastResultDate = this.getLastResultDate(definitionGr, targetGr);
                            if (lastResultDate && lastResultDate.compareTo(targetUpdateDate) > -1) continue;
                        }

                        this.runScanOnRecord(definitionGr, targetGr);
                    }
                }
            }
        }
    },

    runScansOnUpdate: function(targetGr) {
        // looking through all the jobs to get the active ones 
        var scanIds = new Set();
        var jobGr = new GlideRecordSecure(this.SCHEDULED_JOB_CONFIGURATION);
        jobGr.addActiveQuery();
        jobGr.addQuery("query_table", "kb_knowledge");
        jobGr.query();
        while (jobGr.next()) {
            // checking the conditions to make sure the updated KB matches the criteria
            var conditions = jobGr.getValue("query_conditions");
            var queryChecker = new GlideRecordSecure('kb_knowledge');
            queryChecker.addQuery("sys_id", targetGr.sys_id);
            if (conditions) queryChecker.addEncodedQuery(conditions, true);
            queryChecker.query();
            if (queryChecker.next()) {
                var jobM2mScan = new GlideRecordSecure(this.JOB_M2M_SCAN);
                jobM2mScan.addQuery('kb_assist_job', jobGr.sys_id);
                jobM2mScan.query();
                while (jobM2mScan.next()) {
                    scanIds.add(jobM2mScan.getValue('scan_definition'));
                }
            }
        }

        if (scanIds.size > 0) {
            scanIds.forEach(scan => {
                var definitionGr = new GlideRecordSecure(this.SCAN_DEFINITION);
                if (definitionGr.get(scan)) {
                    if (this.canRunScan(definitionGr)) {
                        this.runScanOnRecord(definitionGr, targetGr);
                    } else {
                        gs.error("Article Optimization scan definition \"" + definitionGr.getDisplayValue('name') + "\" did not run because a required skill is not enabled.");
                    }
                }
            });
            if (this.isHealthScoreEligible()) {
                var articleHealthScoreUtil = new sn_km_center.KBArticleHealthScoreUtil();
                articleHealthScoreUtil.recalculateForArticle(targetGr);
            }
        }
    },

    runScanOnRecord: function(definitionGr, targetGr) {
        //create glideRecord so target won't be modified
        var results = [];
        var existingResults = {};
        var scriptGr;
        var err = "";
        try {
            scriptGr = new GlideRecordSecure(targetGr.sys_class_name);
            scriptGr.get(targetGr.getUniqueValue());
        } catch (e) {
            //Potential Cross Scope Error for tables
            this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error retrieving article"), e);
            return;
        }

        //If Knowledge Article is not latest or published, don't run scan
        if (this.isKnowledge(targetGr)) {
            if (!this.isLatestOrPublished(targetGr)) {
                //delete any existing results for old articles if they exist
                this.closeAllPreviousResults(definitionGr, targetGr);
                return;
            }
        }

        var evaluator;
        if (definitionGr.getValue("execution_type").contains("script")) {
            //Evaluate the script from the field
            evaluator = new GlideScopedEvaluator();
            evaluator.putVariable("results", []);
            evaluator.putVariable("target", scriptGr);
            evaluator.putVariable("utils", this);
            evaluator.putVariable("err", err);
            try {
                evaluator.evaluateScript(definitionGr, 'script');
            } catch (e) {
                //Error thrown while running the script
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error while evaluating script"), e);
                return;
            }
            err = evaluator.getVariable('err');
            if (err != "") {
                //Error caught while running the script
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error caught evaluating script"), err);
                return;
            }
            results = evaluator.getVariable('results');
        } else {
            //Process inputs
            var payload = {};
            var meta = {};
            var runPrompt = true;
            evaluator = new GlideScopedEvaluator();
            evaluator.putVariable("payload", {});
            evaluator.putVariable("meta", {});
            evaluator.putVariable("runPrompt", true);
            evaluator.putVariable("target", scriptGr);
            evaluator.putVariable("utils", this);
            evaluator.putVariable("err", err);
            try {
                evaluator.evaluateScript(definitionGr, 'process_inputs');
            } catch (e) {
                //Error thrown while running the process_inputs script
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error in script while processing inputs"), e);
                return;
            }
            err = evaluator.getVariable('err');
            if (err != "") {
                //Error caught while running the process_inputs script
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error in script while processing inputs"), err);
                return;
            }
            payload = evaluator.getVariable('payload');
            meta = evaluator.getVariable('meta');
            runPrompt = evaluator.getVariable('runPrompt');

            //Don't run if there is no capability or if runPrompt is set to false
            if (gs.nil(definitionGr.ai_config) || !runPrompt) {
                return;
            }

            //set the language of the article
            if (scriptGr.getValue("language")) {
                meta.dtTargetLanguage = scriptGr.getValue("language");
            }

            var capabilityId = this.ARTICLE_OPTIMIZATION_CAPABILITY_ID;
            var aiConfigGr = definitionGr.ai_config.getRefRecord();
            if (aiConfigGr.isValidRecord()) {
                var skillDefinitionGr = new GlideRecord(aiConfigGr.getValue("definition_table"));
                skillDefinitionGr.get(aiConfigGr.getValue("definition"));
                capabilityId = skillDefinitionGr.getValue("capability");
            }

            var request = {
                "executionRequests": [{
                    "payload": payload,
                    "meta": meta,
                    "capabilityId": capabilityId
                }]
            };

            var responses = sn_one_extend.OneExtendUtil.execute(request);
            var response = null;

            try {
                var rawResponse = responses.capabilities[capabilityId].response;

                // Parse rawResponse if it is a string
                if (typeof rawResponse === 'string') {
                    rawResponse = JSON.parse(rawResponse);
                }

                // Parse model_output if it exists and is a string
                if (rawResponse.model_output) {
                    response = typeof rawResponse.model_output === 'string' ?
                        JSON.parse(rawResponse.model_output) :
                        rawResponse.model_output;
                } else {
                    response = rawResponse;
                }
            } catch (e) {
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error while processing output from LLM"), e);
                return;
            }

            evaluator = new GlideScopedEvaluator();
            evaluator.putVariable("results", []);
            evaluator.putVariable("target", scriptGr);
            evaluator.putVariable("utils", this);
            evaluator.putVariable("err", err);
            try {
                evaluator.putVariable("response", response);
                evaluator.evaluateScript(definitionGr, 'process_outputs');
            } catch (e) {
                //Error caught while running the process_outputs script
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error in script while processing outputs"), e);
                return;
            }
            err = evaluator.getVariable('err');
            if (err != "") {
                //Error caught while running the process_outputs script
                this.createErrorResult(definitionGr, targetGr, gs.getMessage("Error in script while processing outputs"), err);
                return;
            }
            results = evaluator.getVariable('results');
        }

        // Calculate health score for this AO scan run
        var healthScore = -1;
        if (definitionGr.getValue("calculate_health_score")) {
            var healthScoreEvaluator = new GlideScopedEvaluator();
            healthScoreEvaluator.putVariable("healthScore", -1);
            try {
                healthScoreEvaluator.putVariable("results", results);
                healthScoreEvaluator.evaluateScript(definitionGr, 'calculate_health_score');
            } catch (e) {
                gs.error("Error while evaluating calculate_health_score", e);
            }
            healthScore = healthScoreEvaluator.getVariable('healthScore');
            healthScore = parseInt(healthScore, 10);
            if (isNaN(healthScore)) healthScore = -1;
        }

        //If scan did not create a result, we can assume no recommendation, so create
        //a closed result so the scan won't run again if it found no results, and 
        // close any open and ignored pre-existing results as they no longer apply
        if (results.length == 0) {
            this.closeAllPreviousResults(definitionGr, targetGr);
            //only create a closed result when run_type is onchange
            if (definitionGr.getValue("run_type") === "onchange") {
                results.push(this.createClosedResult(gs.getMessage("No recommendation for this scan")));
            }
        } else {
            existingResults = this.cleanupPreviousResults(definitionGr, targetGr, results.map(result => JSON.stringify(result)), healthScore);
        }

        results.forEach((result, index) => {
            // do not create a new result record if its been ignored before
            if (existingResults[this.normalizeResultKey(JSON.stringify(result))]) return;
            var scanResultGr = new GlideRecordSecure(this.SCAN_RESULT);
            scanResultGr.setValue("result", JSON.stringify(result));
            scanResultGr.setValue("message", result.message);
            scanResultGr.setValue("state", result.state || "open");
            scanResultGr.setValue("scan_definition", definitionGr.sys_id);
            scanResultGr.setValue("target_table", targetGr.sys_class_name);
            scanResultGr.setValue("target_record", targetGr.getValue("sys_id"));
            scanResultGr.setValue("knowledge_article", targetGr.getValue("sys_id"));
            scanResultGr.setValue("order", index);
            scanResultGr.setValue("health_score", healthScore);
            scanResultGr.setValue("confidence_score", result.confidence_score);
            scanResultGr.insert();
        });
    },

    createErrorResult: function(definitionGr, targetGr, message, error) {
        this.closeAllPreviousResults(definitionGr, targetGr);

        var scanResultGr = new GlideRecordSecure(this.SCAN_RESULT);
        scanResultGr.setValue("result", error);
        scanResultGr.setValue("message", message);
        scanResultGr.setValue("state", "error");
        scanResultGr.setValue("scan_definition", definitionGr.getValue("sys_id"));
        scanResultGr.setValue("target_table", targetGr.sys_class_name);
        scanResultGr.setValue("target_record", targetGr.getValue("sys_id"));
        scanResultGr.setValue("knowledge_article", targetGr.getValue("sys_id"));
        scanResultGr.insert();
    },

    copyResultsOnCheckout: function(targetGr) {
        var results = new GlideRecordSecure(this.SCAN_RESULT);
        results.addQuery('target_record', targetGr.base_version);
        results.addEncodedQuery("state=ignore^ORstate=open", true);
        results.query();
        while (results.next()) {
            var gr = new GlideRecordSecure(this.SCAN_RESULT);
            gr.initialize();
            gr.setValue("target_record", targetGr.getValue("sys_id"));
            gr.setValue("knowledge_article", targetGr.getValue("sys_id"));
            gr.setValue("scan_definition", results.getValue("scan_definition"));
            gr.setValue("result", results.getValue("result"));
            gr.setValue("message", results.getValue("message"));
            gr.setValue("target_table", results.getValue("target_table"));
            gr.setValue("state", results.getValue("state"));
            gr.setValue("order", results.getValue("order"));
            gr.setValue("health_score", results.getValue("health_score"));
            gr.setValue("confidence_score", results.getValue("confidence_score"));
            gr.insert();
        }
        if (this.isHealthScoreEligible()) {
            var articleHealthScoreUtil = new sn_km_center.KBArticleHealthScoreUtil();
            articleHealthScoreUtil.recalculateForArticle(targetGr);
        }
    },

    canAccessResult: function(current) {
        if (!current.target_table) {
            return false;
        }
        var target = new GlideRecordSecure(current.target_table);
        if (target.get(current.target_record)) {
            var kbKnowledge = new global.KBKnowledge();
            return kbKnowledge.safeExecute(kbKnowledge._knowledgeHelper.canContribute, target) ||
                kbKnowledge.isMemberOfValidGroup(target, kbKnowledge.OWNERSHIP_GROUP);
        }
        return false;
    },

    parseHTMLIntoXML: function(html, wrapperText) {
        //private function to parse the xml
        var parseXMLDoc = function(text) {
            var xmlDoc = new XMLDocument2();
            xmlDoc.parseXML(text);

            if (xmlDoc.toString() == "") {
                return null;
            }

            //if no error, return
            return xmlDoc;
        };

        //private function to close html tags that aren't properly closed
        var closeVoidTags = function(text) {
            var voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
                'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
            ];

            var result = text;
            // Self-close void elements
            for (var i = 0; i < voidTags.length; i++) {
                var tag = voidTags[i];
                var re = new RegExp('<(' + tag + ')(\\s[^>]*)?>(?!\\s*</\\1)', 'gi');
                result = result.replace(re, '<$1$2 />');
            }
            // Lowercase tag names
            result = result.replace(/<\/?([A-Z][A-Z0-9]*)\b/g, function(m, t) {
                return m.replace(t, t.toLowerCase());
            });
            return result;
        };

        //private function to strip HTML comments, which XML forbids from
        //containing "--" anywhere in their body; scans never need comment text
        var stripComments = function(text) {
            return text.replace(/<!--[\s\S]*?-->/g, '');
        };

        //private function to make ordinary HTML entities/ampersands XML-safe.
        //HTML tolerates a bare "&" (the "ambiguous ampersand" rule) and defines
        //~2000 named character references; XML only recognizes 5 and treats any
        //other bare "&" as a fatal error. Known named entities are converted to
        //their numeric XML-safe form; anything else is escaped as a literal "&".
        var HTML_NAMED_ENTITIES = {
            nbsp: 160, mdash: 8212, ndash: 8211, hellip: 8230,
            lsquo: 8216, rsquo: 8217, ldquo: 8220, rdquo: 8221,
            trade: 8482, copy: 169, reg: 174, deg: 176,
            times: 215, divide: 247, euro: 8364, pound: 163,
            yen: 165, cent: 162, sect: 167, para: 182,
            middot: 183, laquo: 171, raquo: 187, bull: 8226, prime: 8242,
            eacute: 233, egrave: 232, agrave: 224, aacute: 225,
            acirc: 226, auml: 228, ouml: 246, uuml: 252,
            ntilde: 241, ccedil: 231, iacute: 237, oacute: 243, uacute: 250
        };
        var XML_BUILTIN_ENTITIES = { amp: true, lt: true, gt: true, apos: true, quot: true };
        var neutralizeAmpersands = function(text) {
            return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*)?;?/g, function(match, ref) {
                if (!ref) {
                    return '&amp;'; // bare "&" not part of any reference
                }
                if (/^#/.test(ref) || XML_BUILTIN_ENTITIES[ref]) {
                    return match; // already XML-safe numeric or built-in reference
                }
                if (HTML_NAMED_ENTITIES.hasOwnProperty(ref)) {
                    return '&#' + HTML_NAMED_ENTITIES[ref] + ';';
                }
                return '&amp;' + ref + (match.charAt(match.length - 1) === ';' ? ';' : '');
            });
        };

        //private function combining all HTML->XML normalization steps used on retry
        var normalizeHtmlForXml = function(text) {
            var result = stripComments(text);
            result = closeVoidTags(result);
            result = neutralizeAmpersands(result);
            return result;
        };

        //main function to parse the xml and throw an error
        var wrappedHTML = "<" + wrapperText + ">" + html + "</" + wrapperText + ">";
        var xmlDoc = null;
        //initial pass
        try {
            xmlDoc = parseXMLDoc(wrappedHTML);
        } catch (e) {
            xmlDoc = null;
        }
        //try again with full HTML->XML normalization if the first pass failed,
        //whether it threw OR silently produced an empty document
        if (xmlDoc == null) {
            try {
                var normalizedHTML = normalizeHtmlForXml(wrappedHTML);
                //if not fixed, this will throw the error
                xmlDoc = parseXMLDoc(normalizedHTML);
            } catch (e) {
                xmlDoc = null;
            }
        }
        return xmlDoc;
    },

    isHealthScoreEligible: function() {
        return GlidePluginManager.isActive('sn_km_gen_ai') && new sn_km_center.HealthScoreUtils().isHealthScoreEligible();
    },

    /**
     * Public entry point to re-trigger the article health score calculation.
     * Lets callers in other scopes (which cannot reach the package_private
     * KBArticleHealthScoreUtil directly) recalculate an article's health score
     * through this public Script Include.
     *
     * @param {GlideRecord} targetGr - the kb_knowledge article to recalculate
     */
    recalculateHealthScore: function(targetGr) {
        if (this.isHealthScoreEligible()) {
            new sn_km_center.KBArticleHealthScoreUtil().recalculateForArticle(targetGr);
        }
    },
    
    backfillKnowledgeArticle: function() {
        var start = new GlideDateTime();
        gs.info('ArticleAssistUtils.backfillKnowledgeArticle: Starting backfill, time: ' + start);

        var agg = new GlideAggregate(this.SCAN_RESULT);
        agg.addQuery('knowledge_article', '');
        agg.addNotNullQuery('target_record');
        agg.groupBy('target_record');
        agg.query();

        var count = 0;
        while (agg.next()) {
            var targetSysId = agg.getValue('target_record');
            var gr = new GlideRecord(this.SCAN_RESULT);
            gr.addQuery('target_record', targetSysId);
            gr.addQuery('knowledge_article', '');
            gr.setWorkflow(false);
            gr.autoSysFields(false);
            gr.setValue('knowledge_article', targetSysId);
            gr.updateMultiple();
            count++;
        }

        var end = new GlideDateTime();
        gs.info('ArticleAssistUtils.backfillKnowledgeArticle: Finished, updated ' + count + ' target_record group(s), time: ' + end);
        gs.info('ArticleAssistUtils.backfillKnowledgeArticle: Total time taken: ' + (end.getNumericValue() - start.getNumericValue()) + 'ms');
    },

    type: 'ArticleAssistUtils'
};
