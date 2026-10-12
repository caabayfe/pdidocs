var SuggestedUtteranceUtil = Class.create();
SuggestedUtteranceUtil.prototype = {
    initialize: function() {
        this.insertCount = 0;
        this.updateCount = 0;
        this.buffer = {};
    },

    seedSuggestedUtterances: function(referenceProfile, targetProfile) {
        this._seedUtterancesFromTriggeredGRs(referenceProfile, targetProfile);
        this._seedUtterancesFromQnALog(referenceProfile, targetProfile);
        gs.info("Finished seeding suggested utterances for profile: " + targetProfile + ". Count of historical citations used: " + (this.updateCount + this.insertCount));
    },

    enqueueSuggestedUtteranceSeedingJob: function(referenceSearchAppId, targetSearchAppId) {
        var referenceSacGR = new GlideRecord('sys_search_context_config');
        var targetSacGR = new GlideRecord('sys_search_context_config');
        var invalidSacError = "Unable to initiate job to seed Suggested Utterances for Search Application because the Search Application could not be found. Sys ID: ";
        if (!referenceSacGR.get(referenceSearchAppId)) {
            gs.error(invalidSacError + referenceSearchAppId);
            return;
        }
        if (!targetSacGR.get(targetSearchAppId)) {
            gs.error(invalidSacError + targetSearchAppId);
            return;
        }

        var referenceProfileId = referenceSacGR.getValue('search_profile');
        var targetProfileId = targetSacGR.getValue('search_profile');
        var eventName = 'search_suggested_utterance_seeding.start';

        // We don't want to run the same job more than once, as it would unnecessarily 
        // skew the scores on the suggested utterance records
        var sysEventGr = new GlideRecord('sysevent');
        sysEventGr.addQuery('name', eventName);
        sysEventGr.addQuery('parm1', referenceProfileId);
        sysEventGr.addQuery('parm2', targetProfileId);
        sysEventGr.addQuery('state', '!=', 'error');
        sysEventGr.setLimit(1);
        sysEventGr.query();
        if (sysEventGr.hasNext()) {
            gs.warn("Skipping job to seed suggested utterances for profile " +
                targetSacGR.getDisplayValue('search_profile') + " based on search history for profile " +
                referenceSacGR.getDisplayValue('search_profile') +
                " because a job has already been processed for this combination of profiles");
            return;
        }

        gs.eventQueue(eventName, null, referenceProfileId, targetProfileId);
        gs.info("Enqueued job to seed suggested utterances for profile " + targetSacGR.getDisplayValue('search_profile') + " based on search history for profile " + referenceSacGR.getDisplayValue('search_profile'));
    },

    /**
     * Queries the Triggered GR table for NA Action or Synth GR records, as these are a good source for cat item citations
     */
    _seedUtterancesFromTriggeredGRs: function(referenceProfile, targetProfile) {
        var searchEventGrs = new GlideRecord("sys_search_event");
        searchEventGrs.addEncodedQuery("sys_created_onRELATIVEGT@dayofweek@ago@30");
        searchEventGrs.addQuery("gr_configuration_displayed", "IN", "a17c66ef77b9f110be280d892c5a9986,088c73a5430302104eaff03a5ab8f22f" // NA Actions or Synth GR
        );
        searchEventGrs.addQuery("ais_profile", referenceProfile);
        searchEventGrs.query();
        while (searchEventGrs.next()) {
            var triggeredGrs = new GlideRecord(
                "sys_search_signal_genius_result_triggered_event"
            );
            var joinCondition = triggeredGrs.addJoinQuery("sys_search_signal_event", "search_signal_event", "sys_id");
            joinCondition.addCondition("search_event", searchEventGrs.getUniqueValue());
            triggeredGrs.addQuery("source_table", "sc_cat_item"); // TODO - add other tables like va skills and topics, once confirmed they're logged correctly
            triggeredGrs.query();
            while (triggeredGrs.next()) {
                this._logCitation(
                    searchEventGrs.getValue("search_query"),
                    targetProfile,
                    searchEventGrs.getValue("language"),
                    triggeredGrs.getValue("source_table"),
                    triggeredGrs.getValue("result_doc_id"),
                    "sys_search_signal_genius_result_triggered_event"
                );
            }
        }
        this._flushBuffer();
    },

    /**
     * Looks up citations for knowledge articles from the QnA log table, if there's a KB search source present on the target profile 
     */
    _seedUtterancesFromQnALog: function(referenceProfile, targetProfile) {
        var kbSearchSourceGr = new GlideRecord("ais_search_profile_ais_search_source_m2m");
        kbSearchSourceGr.addQuery("profile", targetProfile);
        var searchSourceJoinCondition = kbSearchSourceGr.addJoinQuery("ais_search_source", "search_source", "sys_id");
        searchSourceJoinCondition.addCondition("datasource", "kb_knowledge");
        kbSearchSourceGr.query();
        if (!kbSearchSourceGr.next()) {
            gs.warn("Target profile: " + targetProfile + " doesn't have KB Knowledge as a search source, so will skip mining QnA log");
            return;
        }

        var searchSourceCondition =
            kbSearchSourceGr.search_source.condition.getValue();

        var searchEventsGA = new GlideAggregate("sys_search_event");
        searchEventsGA.addEncodedQuery("sys_created_onRELATIVEGT@dayofweek@ago@30");
        searchEventsGA.addQuery("gr_configuration_displayed", "a51b6528432121102547947bbfb8f23f"); // NA Q&A
        searchEventsGA.addQuery("ais_profile", referenceProfile);
        searchEventsGA.groupBy("search_query");
        searchEventsGA.groupBy("language");
        searchEventsGA.query();
        while (searchEventsGA.next()) {
            var term = searchEventsGA.getValue("search_query");
            var language = searchEventsGA.getValue("language");

            var qnaLogGr = new GlideRecord("sn_ais_assist_qna_log");
            qnaLogGr.addEncodedQuery("sys_created_onRELATIVEGT@dayofweek@ago@30");
            qnaLogGr.addQuery("gr_configuration", "a51b6528432121102547947bbfb8f23f");
            qnaLogGr.addQuery('question', term);
            qnaLogGr.addQuery('session_language', language);
            qnaLogGr.addQuery('kb_language', language);
            qnaLogGr.addEncodedQuery('answerNOT LIKEcitations":[]');
            qnaLogGr.query();
            while (qnaLogGr.next()) {
                try {
                    var answerJson = JSON.parse(qnaLogGr.getValue("answer"));
                    var citationsList = answerJson.citations;
                    for (var c = 0; c < citationsList.length; c++) {
                        var sources = citationsList[c].citation_sources;
                        for (var s = 0; s < sources.length; s++) {
                            var kbSysId = sources[s].source_sys_id;
                            var kbGr = new GlideRecord("kb_knowledge");
                            kbGr.addQuery("sys_id", kbSysId);
                            kbGr.addEncodedQuery(searchSourceCondition);
                            kbGr.query();
                            if (!kbGr.next()) {
                                gs.warn(
                                    "Skipping citation for QNA citation: " + sources[s].source_sys_id +
                                    " as it either no longer exists or doesn't meet the search source filter criteria"
                                );
                                continue;
                            }
                            this._logCitation(term, targetProfile, language, "kb_knowledge", sources[s].source_sys_id, "sn_ais_assist_qna_log");
                        }
                    }
                } catch (e) {
                    gs.error("Error processing QnA log entry: " + qnaLogGr.getUniqueValue() + " with error: " + e);
                }
            }
        }
        this._flushBuffer();
    },

    _logCitation: function(term, profile, language, table, sysId, source) {
        var normalizedTerm = term
            .replace(/[^a-zA-Z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
        var bufferKey = sysId + '_' + language + '_' + profile + '_' + normalizedTerm;
        if (bufferKey in this.buffer) {
            this.buffer[bufferKey].scoreUpdates++;
            this.updateCount++;
        } else {
            var existingCitation = new GlideRecord("sys_suggested_utterance");
            existingCitation.addQuery("citation_id", sysId);
            existingCitation.addQuery("citation_table", table);
            existingCitation.addQuery("language", language);
            existingCitation.addQuery("profile", profile);
            existingCitation.addQuery("utterance", normalizedTerm);
            existingCitation.query();
            if (existingCitation.next()) {
                this.buffer[bufferKey] = {
                    sysId: existingCitation.getValue('sys_id'),
                    scoreUpdates: 1
                };
                this.updateCount++;
            } else {
                var newCitationGr = new GlideRecord("sys_suggested_utterance");
                newCitationGr.initialize();
                newCitationGr.citation_id = sysId;
                newCitationGr.citation_table = table;
                newCitationGr.generation_source = source;
                newCitationGr.language = language;
                newCitationGr.profile = profile;
                newCitationGr.utterance = normalizedTerm;
                newCitationGr.score = 1;
                var newSysId = newCitationGr.insert();
                this.buffer[bufferKey] = {
                    sysId: newSysId,
                    scoreUpdates: 0
                };
                this.insertCount++;
            }
        }
        if (this.updateCount > 0 && this.updateCount % 10 == 0) {
            gs.info("Update count is : " + this.updateCount + " so flushing buffer");
            this._flushBuffer();
        }
    },

    _flushBuffer: function() {
        for (var key in this.buffer) {
            var sysId = this.buffer[key].sysId;
            var scoreUpdates = this.buffer[key].scoreUpdates;
            if (scoreUpdates > 0) {
                var gr = new GlideRecord('sys_suggested_utterance');
                if (gr.get(sysId)) {
                    gr.score = parseInt(gr.getValue('score')) + scoreUpdates;
                    gr.update();
                    this.buffer[key].scoreUpdates = 0;
                } else {
                    gs.error("SuggestedUtteranceUtil: Unable to retreive suggested utterance record with sys_id " + sysId + " to increment score while flushing buffer");
                }
            }
        }
    },

    type: 'SuggestedUtteranceUtil'
};
