var GenAILargeInputPreprocessor = Class.create();
GenAILargeInputPreprocessor.prototype = {
    LOGGER: new sn_log.GlideLogger("global.GenAILargeInputPreprocessor"),
    initialize: function() {},
    REQUEST_ONLY: "request_only",
    REQUEST_AND_RESPONSE: "request_and_response",
    RESPONSE_ONLY: "response_only",
    GUARDIAN_CAPABILITY: "2e50d77b7f1c921071cab6257d866594",
    // Regex for sentence boundaries (supports multiple languages)
    // DT regex reference for sentence boundaries :: https://code.devsnc.com/dev/dynamic-translation-service/blob/main/src/dynamic_translation_service/text_processing/splitter.py#L42
    SENTENCE_END_REGEX: /[.?!\u06D4\u061F\u1362\u1367\u0589\u055E\u166E\u3002\u0964\uFF0E\uFF1F]\s+/g,
    _handleGuardianProcess: function(input, provider, chunkableAttributes, tokenCalculator, executionMode) {
        var capability = input["_meta"]["capability"];

        if (input && input._meta) {
            capability = input._meta.parentCapabilityId || capability;
        }

        var attributeGR = new GlideRecord('sys_one_extend_definition_attribute');
        attributeGR.addQuery("type", "input");
        attributeGR.addQuery("capability", capability);
        attributeGR.query();
        var totalRequestTokens = 0;
        var guardianInput = input.input;
        var raw_output = input.raw_output;
        if (executionMode === this.REQUEST_ONLY || executionMode === this.REQUEST_AND_RESPONSE) {
            var mergeInput = {};
            while (attributeGR.next()) {
                var key = attributeGR.getValue("name");
                var attributeValue = guardianInput[key] || "";
                if (!gs.nil(attributeValue)) {
                    mergeInput[key] = attributeValue;
                }
                var attributeDataType = attributeGR.getValue("data_type");
                if (attributeDataType === "json_array" || attributeDataType === "simple_array" || attributeDataType === "json_object") {
                    try {
                        attributeValue = (typeof attributeValue != "string") ? JSON.stringify(attributeValue) : attributeValue;
                    } catch (e) {
                        attributeValue = "";
                    }
                } else {
                    attributeValue = attributeValue.toString();
                }

                if (provider === "Azure OpenAI Guardian") {
                    totalRequestTokens += attributeValue.length;
                } else {
                    var totalAttributeTokens = tokenCalculator.getTokenCount(attributeValue, provider, 0);
                    totalRequestTokens += totalAttributeTokens;
                }
            }

            chunkableAttributes.push({
                attributeName: "guardianChunkInput",
                attributeValue: mergeInput,
                attributeDataType: "json_object"
            });
        }
        if (executionMode === this.RESPONSE_ONLY || executionMode === this.REQUEST_AND_RESPONSE) {
            if (raw_output) {
                // Process raw_output based on its type:
                // 1. If it's an array with single element, extract that element
                // 2. If it's already a string, use it as is
                // 3. Otherwise, stringify the value (for objects or arrays with multiple elements)
                raw_output = Array.isArray(raw_output) && raw_output.length === 1 ?
                    raw_output[0] // Extract single element from array
                    :
                    (typeof raw_output === 'string' ?
                        raw_output // Use string as is, avoid double stringification
                        :
                        JSON.stringify(raw_output)); // Convert objects/arrays to string
                if (provider === "Azure OpenAI Guardian") {
                    totalRequestTokens += raw_output.length;
                } else {
                    totalRequestTokens += tokenCalculator.getTokenCount(raw_output, provider, 0);
                }
            }
        }
        return totalRequestTokens;
    },
    _processGuardian: function(input, remainingTokens, maxTokens, provider) {
        // Query for attributes
        var chunkableAttributes = [];

        var totalRequestTokens = 0;
        var nonSummarizeLengthTotal = 0;
        var tokenCalculator = new sn_generative_ai.TokenCalculator();
        var executionMode = input.executionMode;
        if (gs.nil(executionMode)) {
            executionMode = new sn_generative_ai.GenAIGuardianPrepareInputs()._getExecutionMode(input);
        }
        totalRequestTokens = this._handleGuardianProcess(input, provider, chunkableAttributes, tokenCalculator, executionMode);

        if (totalRequestTokens < remainingTokens || chunkableAttributes.length == 0) {
            return JSON.stringify({
                parts: [input]
            });
        }

        var chunkingParams = {};
        try {
            chunkingParams = JSON.parse(gs.getProperty("com.glide.one_extend.chunking_params") || "{}");
        } catch (e) {
            this.LOGGER.warn("[GenAILargeInputPreprocessor] Failed to parse chunking params, using defaults: " + e.message);
            chunkingParams = {};
        }

        var allParts = [];
        // skip the chunking of guardian input attributes if it's RESPONSE_ONLY mode
        if (executionMode !== this.RESPONSE_ONLY) {
            for (var i = 0; i < chunkableAttributes.length; i++) {
                allParts.push(this._chunkAttributeGuardian(
                    chunkableAttributes[i].attributeName,
                    chunkableAttributes[i].attributeValue || "",
                    chunkableAttributes[i].attributeDataType,
                    remainingTokens,
                    provider,
                    chunkingParams,
                    executionMode
                ));
            }
        }

        if (input.raw_output) {
            this._chunkGuardianResponse(allParts, input.raw_output, remainingTokens, provider, chunkingParams, executionMode);
        }

        var parts = this._guardianChunks(allParts);

        var parentFilter = {};
        if (parts.length > 0) {
            // For combination request
            parentFilter = input["_meta"].configFilters || {};
        } else {
            parts.push(input);
        }

        var result = {
            parentFilter: parentFilter || {},
            parts: parts
        };

        return JSON.stringify(result);
    },
    /**
     * Converts a GenAI request from large input to parts with chunks.
     *
     * @param {String} input - GenAI input request, JSON, stringified.
     * @param {Number} remainingTokens - Remaining tokens in the request.
     * @param {Number} maxTokens - Maximum response tokens for a request.
     * @param {String} provider - Name of the LLM service provider.
     *
     * @return {Object}
     * {
     *  parentFilter: {Object} - Filters for the combine prompt,
     *  parts: {Array} - Part objects containing input attributes, chunked attribute and filter
     * }
     */
    process: function(input, remainingTokens, maxTokens, provider) {
        // Query for attributes
        input = input ? JSON.parse(input) : {};
        var chunkableAttributes = [];
        var capability = input["_meta"]["guardianCapabilityId"] || input["_meta"]["capability"];
        var guardianFlag = this.GUARDIAN_CAPABILITY === capability;
        if (guardianFlag) {
            return this._processGuardian(input, remainingTokens, maxTokens, provider);
        }

        var attributeGR = new GlideRecord('sys_one_extend_definition_attribute');
        attributeGR.addQuery("type", "input");
        attributeGR.addQuery("capability", capability);
        attributeGR.query();

        var totalRequestTokens = 0;
        var nonSummarizeLengthTotal = 0;
        var tokenCalculator = new sn_generative_ai.TokenCalculator();

        while (attributeGR.next()) {
            if (attributeGR.contains_large_input == true) {
                var attributeValueStr = input[attributeGR.getValue("name")] || "";
                if (attributeGR.getValue("data_type") === "json_array" || attributeGR.getValue("data_type") === "simple_array" || attributeGR.getValue("data_type") === "json_object") {
                    attributeValueStr = JSON.stringify(attributeValueStr);
                }
                var nonSummarizeLength = Math.min(tokenCalculator.getTokenCount(attributeValueStr, provider, 0), maxTokens);
                chunkableAttributes.push({
                    attributeName: attributeGR.getValue("name"),
                    attributeValue: input[attributeGR.getValue("name")],
                    attributeDataType: attributeGR.getValue("data_type"),
                    nonSummarizeLength: nonSummarizeLength
                });

                nonSummarizeLengthTotal += nonSummarizeLength;
            }

            var attributeValue = input[attributeGR.getValue("name")] || "";
            var attributeDataType = attributeGR.getValue("data_type");

            // If JSON, stringify
            if (attributeDataType === "json_array" || attributeDataType === "simple_array" || attributeDataType === "json_object") {
                try {
                    attributeValue = (typeof attributeValue != "string") ? JSON.stringify(attributeValue) : attributeValue;
                } catch (e) {
                    attributeValue = "";
                }
            } else {
                attributeValue = attributeValue.toString();
            }
            // Clean residual string
            var spaceProcessed = attributeValue.replace(/[^a-zA-z0-9]/g, " ");
            spaceProcessed = spaceProcessed.replace(/\s+/g, " ");

            // Total attribute tokens
            var totalAttributeTokens = tokenCalculator.getTokenCount(spaceProcessed, provider, 0);
            totalRequestTokens += totalAttributeTokens;
        }


        if (totalRequestTokens < remainingTokens || chunkableAttributes.length == 0) {
            return JSON.stringify({
                parts: [input]
            });
        }

        var chunkingParams = {};
        try {
            chunkingParams = JSON.parse(gs.getProperty("com.glide.one_extend.chunking_params") || "{}");
        } catch (e) {
            chunkingParams = {};
        }
        var maxChunks = chunkingParams.chunkLimit || 6;
        if (gs.getProperty("com.glide.one.extend.retain_last_chunk") == "true") {
            maxChunks = Math.floor((remainingTokens - nonSummarizeLengthTotal) / maxTokens);
            maxChunks = Math.min(maxChunks, chunkingParams.chunkLimit || 6);
        }

        var allParts = [];
        for (var i = 0; i < chunkableAttributes.length; i++) {
            allParts.push(this._chunkAttribute(
                chunkableAttributes[i].attributeName,
                chunkableAttributes[i].attributeValue || "",
                chunkableAttributes[i].attributeDataType,
                chunkableAttributes[i].nonSummarizeLength,
                remainingTokens,
                provider,
                chunkingParams
            ));
        }
        var parts = this._limitChunks(allParts, maxChunks);

        var parentFilter = {};
        if (parts.length > 0) {
            // For combination request
            parentFilter = input["_meta"].configFilters || {};
        } else {
            parts.push(input);
        }

        var result = {
            parentFilter: parentFilter || {},
            parts: parts
        };

        return JSON.stringify(result);
    },
    _chunkGuardianResponse: function(allParts, raw_output, remainingTokens, provider, chunkingParams, executionMode) {
        // Process raw_output based on its type:
        // 1. If it's an array with single element, extract that element
        // 2. If it's already a string, use it as is
        // 3. Otherwise, stringify the value (for objects or arrays with multiple elements)
        raw_output = Array.isArray(raw_output) && raw_output.length === 1 ?
            raw_output[0] // Extract single element from array
            :
            (typeof raw_output === 'string' ?
                raw_output // Use string as is, avoid double stringification
                :
                JSON.stringify(raw_output)); // Convert objects/arrays to string
        allParts.push(this._chunkAttributeGuardian(
            "raw_output",
            raw_output || "",
            "string",
            remainingTokens,
            provider,
            chunkingParams,
            executionMode
        ));
    },

    /**
     * Checks if the current instance is appropriate for a given
     * capabilityId and definitionId
     *
     * @param {String} capabilityId - The sys_id for the capability.
     * @param {String} definitionId - The sys_id for the capability definition.
     *
     * @return {Boolean} true/false - is the handler instance valid or not.
     */
    validateHandler: function(capabilityId, definitionId) {
        return true;
    },

    /**
     * Invokes TokenCalculator to count remaining
     * number of tokens in the request prompt
     *
     * @param {String} prompt - Prompt template.
     * @param {Number} requestTokens - Request token limit.
     * @param {String} provider - Name of the LLM service provider.
     *
     * @return {Number} - Number of remaining tokens in the prompt.
     */
    countRemainingTokens: function(prompt, requestTokens, provider) {
        prompt = prompt || "";
        var promptTokenCount = new sn_generative_ai.TokenCalculator().getTokenCount(prompt, provider, 0);
        var remainingTokensBuffer = 50;
        return Math.floor(requestTokens - promptTokenCount - remainingTokensBuffer);
    },

    _isLargeTextForGuardian: function(payload, remainingTokens, provider) {
        payload = typeof(payload) === "string" ? JSON.parse(payload) : payload;
        var executionMode = payload.executionMode;
        if (gs.nil(executionMode)) {
            executionMode = new sn_generative_ai.GenAIGuardianPrepareInputs()._getExecutionMode(payload);
        }
        var tokenInput = "";
        var request = payload.input;
        var response = payload.raw_output;
        request = typeof(request) === "string" ? request : JSON.stringify(request);
        response = typeof(response) === "string" ? response : JSON.stringify(response);
        switch (executionMode) {
            case this.REQUEST_ONLY:
                tokenInput = request;
                break;
            case this.RESPONSE_ONLY:
                tokenInput = response;
                break;
            case this.REQUEST_AND_RESPONSE:
                tokenInput = request + response;
                break;
        }

        if (provider === "Azure OpenAI Guardian") {
            return tokenInput.length >= remainingTokens;
        }
        var tokenCalculator = new sn_generative_ai.TokenCalculator();
        var payloadTokenCount = this._handleGuardianProcess(payload, provider, [], tokenCalculator, executionMode);
        if (payloadTokenCount >= remainingTokens) {
            return true;
        }
        return false;
    },
    /**
     * Checks if recursive execution is required by checking
     * for large text
     *
     * @param {String} payload - Input payload.
     * @param {Number} remainingTokens - Token limit remaining.
     * @param {String} provider - Name of the LLM service provider.
     *
     * @return {Boolean} - Whether given input payload contains large text.
     */
    isLargeText: function(payload, remainingTokens, provider) {
        payload = payload || "";
        try {
            var parsedPayload = JSON.parse(payload);
            if (parsedPayload._meta &&
                (parsedPayload._meta.guardianCapabilityId || parsedPayload._meta.capability) &&
                (this.GUARDIAN_CAPABILITY === parsedPayload._meta.guardianCapabilityId || parsedPayload._meta.capability)) {
                return this._isLargeTextForGuardian(payload, remainingTokens, provider);
            }
        } catch (e) {
            // Safe to ignore parsing errors here, as that means it’s not Guardian execution.
        }
        var payloadTokenCount = new sn_generative_ai.TokenCalculator().getTokenCount(payload, provider, 0);
        if (payloadTokenCount >= remainingTokens) {
            return true;
        }
        return false;
    },
    _guardianChunks: function(allParts) {
        var parts = [];
        var zeroProcessChunks = true;
        for (var attrIdx = 0; attrIdx < allParts.length; attrIdx++) {
            for (var chunkIdx = 0; chunkIdx < allParts[attrIdx].length; chunkIdx++) {
                if (!allParts[attrIdx][chunkIdx] || !allParts[attrIdx][chunkIdx].chunkedAttributeName) {
                    continue;
                }
                parts.push(allParts[attrIdx][chunkIdx]);
            }
        }
        return parts;
    },
    _limitChunks: function(allParts, chunkLimit) {
        var parts = [];
        var zeroProcessChunks = true;
        for (var attrIdx = 0; attrIdx < allParts.length; attrIdx++) {
            for (var chunkIdx = 0; chunkIdx < allParts[attrIdx].length; chunkIdx++) {
                if (!allParts[attrIdx][chunkIdx].chunk || !allParts[attrIdx][chunkIdx].chunkedAttributeName || allParts[attrIdx][chunkIdx].chunk.length < 10) {
                    continue;
                }
                if (!allParts[attrIdx][chunkIdx].action || allParts[attrIdx][chunkIdx].action == "PROCESS") {
                    if (chunkLimit <= 0) {
                        if (zeroProcessChunks) {
                            zeroProcessChunks = false;
                        } else {
                            continue;
                        }
                    } else {
                        zeroProcessChunks = false;
                    }
                    chunkLimit--;
                }
                parts.push(allParts[attrIdx][chunkIdx]);
            }
        }

        return parts;
    },

    _chunkAttributeGuardian: function(attributeName, attributeValue, attributeDataType, remainingTokens, provider, chunkingParams, executionMode) {
        // If JSON, stringify
        if (attributeDataType === "json_array" || attributeDataType === "simple_array" || attributeDataType === "json_object") {
            attributeValue = (typeof attributeValue != "string") ? JSON.stringify(attributeValue) : attributeValue;
        }

        // Clean residual string
        var spaceProcessed = attributeValue;

        // Perform the chunking
        var chunkTokenBufferPercent = chunkingParams.bufferPercent || 0.02;
        var chunkOverlapFactor = chunkingParams.overlapFactor || 6;
        var chunkTokenLength = remainingTokens - (remainingTokens * chunkTokenBufferPercent);
        var chunkOverlapTokens = remainingTokens / chunkOverlapFactor;
        var chunks = [];
        if (provider === "Azure OpenAI Guardian") {
            chunks = this._getCharacterBasedChunksWithBoundaries(spaceProcessed, remainingTokens, chunkOverlapFactor, chunkTokenBufferPercent);
        } else {
            chunks = this._getTokenBasedChunksWithBoundaries(spaceProcessed, chunkTokenLength, chunkOverlapTokens, chunkTokenBufferPercent);
        }

        // Get parts in specified format
        var minChunkLength = 10;
        for (var i = 0; i < chunks.length; i++) {
            // if (chunks[i].chunk.length < minChunkLength) continue;

            // Create input object with dynamic attribute name as key
            var inputObj = {};
            inputObj[attributeName] = chunks[i].chunk;
            inputObj[this.GUARDIAN_CAPABILITY + "_chunk_flag"] = true;
            inputObj.executionMode = executionMode;
            chunks[i] = {};
            chunks[i].input = inputObj;
            chunks[i].action = "PROCESS";
            chunks[i].chunkedAttributeName = attributeName;
        }
        return chunks;
    },
    _chunkAttribute: function(attributeName, attributeValue, attributeDataType, retainLength, remainingTokens, provider, chunkingParams) {
        // If JSON, stringify
        if (attributeDataType === "json_array" || attributeDataType === "simple_array" || attributeDataType === "json_object") {
            attributeValue = JSON.stringify(attributeValue);
        }

        // Clean residual string
        var spaceProcessed = attributeValue.replace(/[^a-zA-z0-9]/g, " ");
        spaceProcessed = spaceProcessed.replace(/\\n+/g, " ");
        spaceProcessed = spaceProcessed.replace(/\\r+/g, " ");
        spaceProcessed = spaceProcessed.replace(/\\+/g, " ");
        spaceProcessed = spaceProcessed.replace(/\s+/g, " ");

        // Perform the chunking
        var chunkTokenBufferPercent = chunkingParams.bufferPercent || 0.02;
        var chunkOverlapFactor = chunkingParams.overlapFactor || 6;
        var chunkTokenLength = remainingTokens - (remainingTokens * chunkTokenBufferPercent);
        var chunkOverlapLength = chunkTokenLength / chunkOverlapFactor;
        var chunks = [];
        if (provider === "Now LLM") {
            chunks = this._getChunksNowLLM(spaceProcessed, chunkTokenLength, chunkOverlapLength, retainLength);
        } else {
            chunks = this._getChunksOpenAI(spaceProcessed, chunkTokenLength, chunkOverlapLength, retainLength);
        }

        // Get parts in specified format
        var minChunkLength = 10;
        for (var i = 0; i < chunks.length; i++) {
            if (chunks[i].chunk.length < minChunkLength) continue;
            chunks[i].chunkedAttributeName = attributeName;
        }
        return chunks;
    },

    _getChunksNowLLM: function(spaceProcessed, chunkTokenLength, chunkOverlapLength, retainLength) {
        var words = spaceProcessed.split(" ").reverse();
        var chunks = [];
        if (gs.getProperty("com.glide.one.extend.retain_last_chunk") == "true") {
            var retainChunk = words.slice(0, retainLength).reverse().join(" ");
            chunks.push({
                chunk: retainChunk,
                action: "RETAIN"
            });
            words = words.slice(retainLength);
        }
        var wordOverlapLength = Math.floor(chunkOverlapLength * 0.8);
        var wordLimit = Math.floor(chunkTokenLength * 0.8);
        var currentPosition = 0;
        while (currentPosition < words.length) {
            var end = currentPosition + wordLimit - 1;
            end = (end > words.length) ? words.length : end;
            var rawTokens = words.slice(currentPosition, end);
            var chunk = rawTokens.reverse().join(" ");

            chunks.push({
                chunk: chunk,
                action: "PROCESS"
            });
            currentPosition += wordLimit;
            currentPosition -= wordOverlapLength;
        }

        return chunks;
    },

    /**
     * Splits text into character-based chunks with sentence/word boundary awareness.
     * Used for Azure OpenAI Guardian provider where chunk size is measured in characters.
     * 
     * @param {string} spaceProcessed - Input text with normalized whitespace
     * @param {number} chunkTokenLength - Maximum chunk size (used as character length for Azure)
     * @param {number} chunkOverlapFactor - Factor to calculate overlap (overlap = effectiveLength / factor)
     * @param {number} chunkTokenBufferPercent - Buffer percentage to reserve for attribute metadata
     * @returns {Array} - Array of chunk objects with 'chunk' and 'action' properties
     */
    _getCharacterBasedChunksWithBoundaries: function(spaceProcessed, chunkTokenLength, chunkOverlapFactor, chunkTokenBufferPercent) {
        var bufferSize = Math.floor(chunkTokenBufferPercent * chunkTokenLength);
        var effectiveChunkLength = chunkTokenLength - bufferSize;
        var overlapSize = Math.floor(effectiveChunkLength / chunkOverlapFactor);

        return this._chunkTextWithBoundaries(spaceProcessed, effectiveChunkLength, overlapSize);
    },

    /**
     * Splits text into token-based chunks with sentence/word boundary awareness.
     * Uses _calculateTokenOpenAI for accurate token counting (1 token ≈ 4 chars + 0.75 per special char).
     * 
     * @param {string} spaceProcessed - Input text with normalized whitespace
     * @param {number} chunkTokens - Maximum tokens per chunk
     * @param {number} overlapTokens - Overlap size in tokens between chunks
     * @returns {Array} - Array of chunk objects with 'chunk' and 'action' properties
     */
    _getTokenBasedChunksWithBoundaries: function(spaceProcessed, chunkTokens, overlapTokens, chunkTokenBufferPercent) {

        var bufferSize = Math.floor(chunkTokenBufferPercent * chunkTokens);
        chunkTokens = chunkTokens - bufferSize;
        var chunks = [];
        var currentPosition = 0;
        var maxEndReached = 0;

        while (currentPosition < spaceProcessed.length) {
            var candidateEnd = this._findChunkEndByTokens(spaceProcessed, currentPosition, chunkTokens);

            // Ensure we make progress
            if (candidateEnd <= currentPosition) {
                candidateEnd = Math.min(currentPosition + 1, spaceProcessed.length);
            }

            var candidateText = spaceProcessed.substring(currentPosition, candidateEnd);

            // Trim at boundary unless candidate reaches end of text
            var chunkText = (candidateEnd >= spaceProcessed.length) ? candidateText : this._trimToNearestBoundary(candidateText);

            // Ensure chunk is not empty after trimming
            if (!chunkText || chunkText.length === 0) {
                chunkText = candidateText;
            }

            var chunkEnd = currentPosition + chunkText.length;

            // Stop if this chunk doesn't cover any new text
            if (chunkEnd <= maxEndReached) {
                break;
            }

            chunks.push({
                chunk: chunkText,
                action: "PROCESS"
            });

            maxEndReached = Math.max(maxEndReached, chunkEnd);

            // Stop if we've reached the end of text
            if (chunkEnd >= spaceProcessed.length) {
                break;
            }

            // Calculate next position with overlap
            var overlapText = this._getOverlapByTokens(chunkText, overlapTokens);
            var advance = chunkText.length - overlapText.length;
            currentPosition += Math.max(advance, 1);
        }

        return chunks;
    },

    /**
     * Binary search to find max end position that stays within token limit.
     * @private
     */
    _findChunkEndByTokens: function(text, startPos, maxTokens) {
        var low = startPos;
        var high = Math.min(startPos + (maxTokens * 5), text.length);

        while (low < high) {
            var mid = Math.floor((low + high + 1) / 2);
            if (this._calculateTokenOpenAI(text.substring(startPos, mid), 0) <= maxTokens) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        return low;
    },

    /**
     * Trims text to nearest sentence boundary, falls back to word boundary.
     * Only trims if boundary is in the latter half of text (>50%).
     * @private
     */
    _trimToNearestBoundary: function(text) {
        if (!text) return text;
        var minBoundary = text.length * 0.5;

        // Try sentence boundary first
        var lastSentenceEnd = this._findLastSentenceEnd(text);
        if (lastSentenceEnd > minBoundary) {
            return text.substring(0, lastSentenceEnd).trim();
        }

        // Fall back to word boundary
        var lastSpace = text.lastIndexOf(' ');
        if (lastSpace > minBoundary) {
            return text.substring(0, lastSpace).trim();
        }

        return text;
    },

    /**
     * Finds the last sentence end position in text.
     * @private
     */
    _findLastSentenceEnd: function(text) {
        var regex = /[.?!\u06D4\u061F\u1362\u1367\u0589\u055E\u166E\u3002\u0964\uFF0E\uFF1F]\s+/g;
        var lastEnd = -1;
        var match;
        regex.lastIndex = 0;
        while ((match = regex.exec(text)) !== null) {
            lastEnd = match.index + match[0].length;
        }
        return lastEnd;
    },

    /**
     * Gets overlap text from end of chunk that fits within overlapTokens.
     * Prefers starting at sentence boundary, falls back to word boundary.
     * @private
     */
    _getOverlapByTokens: function(chunkText, overlapTokens) {
        if (!chunkText || overlapTokens <= 0) return '';

        // Search region: approximate chars needed + buffer
        var searchStart = Math.max(0, chunkText.length - (overlapTokens * 5));
        var searchRegion = chunkText.substring(searchStart);

        // Try sentence boundary first
        var overlap = this._findOverlapAtSentence(searchRegion, overlapTokens);
        if (overlap) return overlap;

        // Fall back to word boundary
        return this._findOverlapAtWord(searchRegion, overlapTokens);
    },

    /**
     * Finds overlap starting at a sentence boundary within token limit.
     * @private
     */
    _findOverlapAtSentence: function(searchRegion, overlapTokens) {
        var regex = /[.?!\u06D4\u061F\u1362\u1367\u0589\u055E\u166E\u3002\u0964\uFF0E\uFF1F]\s+/g;
        var match;
        regex.lastIndex = 0;
        while ((match = regex.exec(searchRegion)) !== null) {
            var candidate = searchRegion.substring(match.index + match[0].length);
            if (this._calculateTokenOpenAI(candidate, 0) <= overlapTokens) {
                return candidate;
            }
        }
        return null;
    },

    /**
     * Finds overlap starting at a word boundary within token limit.
     * @private
     */
    _findOverlapAtWord: function(searchRegion, overlapTokens) {
        var words = searchRegion.split(/\s+/);
        for (var i = 0; i < words.length; i++) {
            var candidate = words.slice(i).join(' ');
            if (this._calculateTokenOpenAI(candidate, 0) <= overlapTokens) {
                return candidate;
            }
        }
        return '';
    },

    // 1 token is 4 characters
    _calculateTokenOpenAI: function(input, buffer) {
        // Search for special characters except underscore
        var re = /[^a-zA-Z0-9\s_]/g;

        // These should be considered as a separate token
        var additionalLength = ((input || '').match(re) || []).length * 0.75;
        return (input.length / 4) + buffer + additionalLength;
    },
    /**
     * Generic text chunking with sentence/word boundary awareness.
     * @private
     * @param {string} spaceProcessed - Input text with normalized whitespace
     * @param {number} chunkCharLength - Maximum chunk size in characters
     * @param {number} overlapCharLength - Overlap size in characters between chunks
     * @returns {Array} - Array of chunk objects with 'chunk' and 'action' properties
     */
    _chunkTextWithBoundaries: function(spaceProcessed, chunkCharLength, overlapCharLength) {
        var chunks = [];
        var sentenceEndRegex = /[.?!\u06D4\u061F\u1362\u1367\u0589\u055E\u166E\u3002\u0964\uFF0E\uFF1F]\s+/g;

        var currentPosition = 0;
        var previousChunk = "";

        while (currentPosition < spaceProcessed.length) {
            var overlapText = "";
            var maxNewContentLength = chunkCharLength;

            // For subsequent chunks, get overlap from previous chunk at a clean boundary
            if (previousChunk.length > 0) {
                overlapText = this._getOverlapAtBoundary(previousChunk, overlapCharLength, sentenceEndRegex);
                maxNewContentLength = chunkCharLength - overlapText.length;
            }

            // Extract candidate text for new content
            var candidateEnd = Math.min(currentPosition + maxNewContentLength, spaceProcessed.length);
            var isLastSegment = (candidateEnd >= spaceProcessed.length);
            var candidateText = spaceProcessed.substring(currentPosition, candidateEnd);

            // Find best break point for new content (sentence > word > full text)
            var newContent = this._trimAtBoundary(candidateText, sentenceEndRegex, isLastSegment);

            // Safety check: avoid infinite loop if no progress
            if (newContent.length === 0) {
                break;
            }

            // Build final chunk: overlap + new content
            previousChunk = overlapText + newContent;

            chunks.push({
                chunk: previousChunk,
                action: "PROCESS"
            });

            // Move position forward by new content length only
            currentPosition += newContent.length;
        }

        return chunks;
    },
    /**
     * Extracts overlap text from the end of a chunk, starting at a clean sentence or word boundary.
     * @param {string} text - The source text to extract overlap from
     * @param {number} targetSize - The target overlap size in characters
     * @param {RegExp} sentenceEndRegex - Regex pattern for sentence boundaries
     * @returns {string} - Overlap text starting at a clean boundary
     */
    _getOverlapAtBoundary: function(text, targetSize, sentenceEndRegex) {
        if (text.length <= targetSize) {
            return text;
        }

        // Start position for overlap (from end of text)
        var startPos = text.length - targetSize;
        var overlapCandidate = text.substring(startPos);

        // Try to find a sentence boundary to start the overlap
        var sentenceStart = this._findFirstSentenceStart(overlapCandidate, sentenceEndRegex);
        if (sentenceStart > 0 && sentenceStart < overlapCandidate.length * 0.5) {
            return overlapCandidate.substring(sentenceStart);
        }

        // Fall back to word boundary (first space)
        var wordStart = overlapCandidate.indexOf(' ');
        if (wordStart > 0 && wordStart < overlapCandidate.length * 0.5) {
            return overlapCandidate.substring(wordStart + 1);
        }

        return overlapCandidate;
    },

    /**
     * Finds the position of the first sentence start in the given text.
     * A sentence start is the position immediately after a sentence-ending punctuation followed by whitespace.
     * @param {string} text - The text to search
     * @param {RegExp} sentenceEndRegex - Regex pattern for sentence boundaries
     * @returns {number} - Position of first sentence start, or -1 if not found
     */
    _findFirstSentenceStart: function(text, sentenceEndRegex) {
        sentenceEndRegex.lastIndex = 0;
        var match = sentenceEndRegex.exec(text);
        if (match) {
            return match.index + match[0].length;
        }
        return -1;
    },

    /**
     * Trims text at the last sentence or word boundary to avoid breaking mid-word/sentence.
     * @param {string} text - The text to trim
     * @param {RegExp} sentenceEndRegex - Regex pattern for sentence boundaries
     * @param {boolean} isLastSegment - If true, returns full text without trimming
     * @returns {string} - Text trimmed at a clean boundary
     */
    _trimAtBoundary: function(text, sentenceEndRegex, isLastSegment) {
        if (isLastSegment) {
            return text;
        }

        // Try sentence boundary first
        var lastSentenceEnd = this._findLastBoundary(text, sentenceEndRegex);
        if (lastSentenceEnd > 0) {
            return text.substring(0, lastSentenceEnd);
        }

        // Fall back to word boundary (last space)
        var lastSpace = text.lastIndexOf(' ');
        if (lastSpace > 0) {
            return text.substring(0, lastSpace);
        }

        return text;
    },

    /**
     * Finds the position after the last regex match in the text.
     * Used to locate the last sentence boundary.
     * @param {string} text - The text to search
     * @param {RegExp} regex - Regex pattern to match (must have global flag)
     * @returns {number} - Position after last match, or -1 if no match found
     */
    _findLastBoundary: function(text, regex) {
        regex.lastIndex = 0;
        var lastEnd = -1;
        var match;

        while ((match = regex.exec(text)) !== null) {
            lastEnd = match.index + match[0].length;
        }

        return lastEnd;
    },

    _getChunksOpenAI: function(spaceProcessed, chunkTokenLength, chunkOverlapLength, retainLength) {
        var currentPosition = 0;
        var chunks = [];
        spaceProcessed = spaceProcessed.split("").reverse().join("");
        if (gs.getProperty("com.glide.one.extend.retain_last_chunk") == "true") {
            var retainChunk = spaceProcessed.split("").slice(0, retainLength * 4).reverse().join("");

            chunks.push({
                chunk: retainChunk,
                action: "RETAIN"
            });

            spaceProcessed = spaceProcessed.substring(retainLength * 4);
        }

        while (currentPosition < spaceProcessed.length) {
            var end = currentPosition + (chunkTokenLength * 4) - 1;
            end = (end > spaceProcessed.length) ? spaceProcessed.length : end;
            var rawSubstring = spaceProcessed.substring(currentPosition, end);
            var rawTokens = rawSubstring.split(" ");
            rawTokens = rawTokens.slice(1, rawTokens.length - 1);
            var chunkText = rawTokens.join(" ").split("").reverse().join("");

            chunks.push({
                chunk: chunkText,
                action: "PROCESS"
            });

            currentPosition += (chunkTokenLength * 4);
            currentPosition -= (chunkOverlapLength * 4);
        }

        return chunks;
    },

    type: 'GenAILargeInputPreprocessor'
};
