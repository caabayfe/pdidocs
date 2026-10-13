var MicrosoftTranslationBatchingUtil = Class.create();
MicrosoftTranslationBatchingUtil.prototype = {
    initialize: function() {},

    getTranslationLimits: function() {
        return {
            'textLimit': parseInt(gs.getProperty('glide.dynamic.translation.microsoft.translate.array.element.limit', 50000)),
            'charLimit': parseInt(gs.getProperty('glide.dynamic.translation.microsoft.translate.request.limit', 50000)),
            'arrayLimit': parseInt(gs.getProperty('glide.dynamic.translation.microsoft.translate.array.limit', 1000))
        };
    },

    getDetectionLimits: function() {
        return {
            'textLimit': parseInt(gs.getProperty('glide.dynamic.translation.microsoft.detect.array.element.limit', 50000)),
            'charLimit': parseInt(gs.getProperty('glide.dynamic.translation.microsoft.detect.request.limit', 50000)),
            'arrayLimit': parseInt(gs.getProperty('glide.dynamic.translation.microsoft.detect.array.limit', 100))
        };
    },

    classifyBulkTexts: function(texts, charLimit) {
        var count = 0;
        var classifiedData = {};
        classifiedData["smallTexts"] = [];
        classifiedData["smallTextsIndices"] = [];
        classifiedData["largeTexts"] = [];
        classifiedData["largeTextsIndices"] = [];
        classifiedData["isBatchingRequired"] = false;
        for (var i = 0; i < texts.length; i++) {
            if (texts[i].length > charLimit) {
                classifiedData["largeTexts"].push(texts[i]);
                classifiedData["largeTextsIndices"].push(i);
            } else {
                classifiedData["smallTexts"].push(texts[i]);
                classifiedData["smallTextsIndices"].push(i);
                count = count + texts[i].length;
                if (count > charLimit) {
                    classifiedData["isBatchingRequired"] = true;
                }
            }
        }
        return classifiedData;
    },

    addLargeTextsToArray: function(isTranslation, result, largeTexts, largeTextsIndices, charLimit, targetLanguages, targetLanguageLimits) {
        for (var large = 0; large < largeTexts.length; large++) {
            if (isTranslation)
                this.transformBatchTextsResponse([largeTexts[large]], [largeTextsIndices[large]], largeTexts[large].length, targetLanguages, charLimit, targetLanguageLimits, result);
            else
                result.push({
                    "texts_to_detect": [largeTexts[large]]
                });
        }
    },

    getBatchTexts: function(texts, indices, limits) {
        var bytesList = [];
        for (var i = 0; i < texts.length; i++) {
            bytesList.push([texts[i].length, i]);
        }
        bytesList.sort();
        var weight = limits.charLimit;
        var splitTexts = [];
        var startIdx = 0;
        var arrayLength = bytesList.length;
        var endIdx = arrayLength - 1;
        var textsProcessed = 0;
        while (textsProcessed < arrayLength) {
            var singleSplit = [];
            var singleSplitIndices = [];
            var tempWeight = 0;
            while (singleSplit.length != limits.arrayLimit &&
                endIdx >= 0 &&
                startIdx <= endIdx &&
                weight >= (tempWeight + bytesList[endIdx][0])) {
                tempWeight += bytesList[endIdx][0];
                singleSplit.push(texts[bytesList[endIdx][1]]);
                singleSplitIndices.push(indices[bytesList[endIdx][1]]);
                endIdx -= 1;
                textsProcessed += 1;
            }
            while (singleSplit.length != limits.arrayLimit &&
                startIdx < arrayLength &&
                startIdx <= endIdx &&
                weight >= (tempWeight + bytesList[startIdx][0])) {
                tempWeight += bytesList[startIdx][0];
                singleSplit.push(texts[bytesList[startIdx][1]]);
                singleSplitIndices.push(indices[bytesList[startIdx][1]]);
                startIdx += 1;
                textsProcessed += 1;
            }
            splitTexts.push({
                "singleSplit": singleSplit,
                "singleSplitIndices": singleSplitIndices
            });
        }
        return splitTexts;
    },

    buildTargetLanguageLimits: function(targetLanguages, charLimit) {
        var limits = [];
        for (var i = 1; i <= targetLanguages.length; i++) {
            limits.push(charLimit / i);
        }
        return limits;
    },

    getMaxTargetLanguagesPerBatch: function(targetLanguageLimits, charCount) {
        var index;
        var left = 0,
            right = targetLanguageLimits.length - 1;
        while (left <= right) {
            var mid = Math.ceil((left + right) / 2);
            if (charCount > targetLanguageLimits[mid]) {
                right = mid - 1;
            } else {
                index = mid;
                left = mid + 1;
            }
        }
        return index + 1;
    },

    splitTargetLanguagesIntoBatches: function(texts, indices, charCount, targetLanguages, targetLanguageLimits, result) {
        var maxTargetLanguagesPerBatch = this.getMaxTargetLanguagesPerBatch(targetLanguageLimits, charCount);
        var tempTargetLanguages = [];
        for (var i = 0; i < targetLanguages.length; i++) {
            tempTargetLanguages.push(targetLanguages[i]);
            if (tempTargetLanguages.length == maxTargetLanguagesPerBatch) {
                result.push({
                    "texts_to_translate": texts,
                    "texts_indices": indices,
                    "target_languages": tempTargetLanguages
                });
                tempTargetLanguages = [];
            }
        }
        if (tempTargetLanguages.length > 0) {
            result.push({
                "texts_to_translate": texts,
                "texts_indices": indices,
                "target_languages": tempTargetLanguages
            });
        }
    },

    transformBatchTextsResponse: function(texts, indices, charCount, targetLanguages, charLimit, targetLanguageLimits, result) {
        if (charCount > charLimit) {
            result.push({
                "texts_to_translate": texts,
                "texts_indices": indices,
                "target_languages": targetLanguages
            });
        } else {
            var limit = charLimit / targetLanguages.length;
            if (charCount > limit) {
                this.splitTargetLanguagesIntoBatches(texts, indices, charCount, targetLanguages, targetLanguageLimits, result);
            } else {
                result.push({
                    "texts_to_translate": texts,
                    "texts_indices": indices,
                    "target_languages": targetLanguages
                });
            }
        }
    },

    processSelectedTexts: function(isTranslation, selectedTexts, selectedTextsIndices, result, limits, targetLanguages, targetLanguageLimits) {
        var tempSelectedTexts = [],
            tempSelectedTextsIndices = [],
            charCount = 0;
        for (var idx = 0; idx < selectedTexts.length; idx++) {
            tempSelectedTexts.push(selectedTexts[idx]);
            tempSelectedTextsIndices.push(selectedTextsIndices[idx]);
            charCount += selectedTexts[idx].length;
            if (tempSelectedTexts.length == limits.arrayLimit) {
                if (isTranslation)
                    this.transformBatchTextsResponse(tempSelectedTexts, tempSelectedTextsIndices, charCount, targetLanguages, limits.charLimit, targetLanguageLimits, result);
                else
                    result.push({
                        "texts_to_detect": tempSelectedTexts
                    });
                tempSelectedTexts = [];
                tempSelectedTextsIndices = [];
                charCount = 0;
            }
        }
        if (tempSelectedTexts.length > 0) {
            if (isTranslation)
                this.transformBatchTextsResponse(tempSelectedTexts, tempSelectedTextsIndices, charCount, targetLanguages, limits.charLimit, targetLanguageLimits, result);
            else
                result.push({
                    "texts_to_detect": tempSelectedTexts
                });
        }
    },

    addSmallTextsToArray: function(isTranslation, smallTexts, smallTextsIndices, result, limits, targetLanguages, targetLanguageLimits) {
        var tempSmallTexts = [],
            tempSmallTextsIndices = [],
            charCount = 0;
        for (var i = 0; i < smallTexts.length; i++) {
            tempSmallTexts.push(smallTexts[i]);
            tempSmallTextsIndices.push(smallTextsIndices[i]);
            charCount += smallTexts[i].length;
            if (tempSmallTexts.length == limits.arrayLimit) {
                if (isTranslation)
                    this.transformBatchTextsResponse(tempSmallTexts, tempSmallTextsIndices, charCount, targetLanguages, limits.charLimit, targetLanguageLimits, result);
                else
                    result.push({
                        "texts_to_detect": tempSmallTexts
                    });
                tempSmallTexts = [];
                tempSmallTextsIndices = [];
                charCount = 0;
            }
        }
        if (tempSmallTexts.length > 0) {
            if (isTranslation)
                this.transformBatchTextsResponse(tempSmallTexts, tempSmallTextsIndices, charCount, targetLanguages, limits.charLimit, targetLanguageLimits, result);
            else
                result.push({
                    "texts_to_detect": tempSmallTexts
                });
        }
    },

    splitInputTextsIntoBatches: function(isTranslation, texts, limits, targetLanguages, targetLanguageLimits) {
        var result = [];
        var classifiedData = this.classifyBulkTexts(texts, limits.textLimit);
        if (classifiedData["isBatchingRequired"]) {
            var splitTexts = this.getBatchTexts(classifiedData.smallTexts, classifiedData.smallTextsIndices, limits);
            for (var idx = 0; idx < splitTexts.length; idx++) {
                var selectedTexts = splitTexts[idx].singleSplit;
                var selectedTextsIndices = splitTexts[idx].singleSplitIndices;
                this.processSelectedTexts(isTranslation, selectedTexts, selectedTextsIndices, result, limits, targetLanguages, targetLanguageLimits);
            }
        } else {
            this.addSmallTextsToArray(isTranslation, classifiedData.smallTexts, classifiedData.smallTextsIndices, result, limits, targetLanguages, targetLanguageLimits);
        }
        this.addLargeTextsToArray(isTranslation, result, classifiedData.largeTexts, classifiedData.largeTextsIndices, limits.charLimit, targetLanguages, targetLanguageLimits);
        return result;
    },

    batchBulkTexts: function(texts, targetLanguages) {
        var limits = this.getTranslationLimits();
        var targetLanguageLimits = this.buildTargetLanguageLimits(targetLanguages, limits.charLimit);
        return this.splitInputTextsIntoBatches(true, texts, limits, targetLanguages, targetLanguageLimits);
    },

    batchBulkDetectTexts: function(texts) {
        return this.splitInputTextsIntoBatches(false, texts, this.getDetectionLimits(), [], []);
    },

    _getProcessedTextResult: function(textResult) {
        var processedTextResult = {};
        var textResultKeys = Object.keys(textResult);
        for (var keyIdx = 0; keyIdx < textResultKeys.length; keyIdx++) {
            var key = textResultKeys[keyIdx];
            if (key == 'text_translations') {
                var textTranslations = [];
                var languages = Object.keys(textResult.text_translations);
                for (var idx = 0; idx < languages.length; idx++) {
                    var language = languages[idx];
                    var textTranslation = {
                        'translated_text': textResult.text_translations[language],
                        'target_language': language
                    };
                    textTranslations.push(textTranslation);
                }
                processedTextResult.text_translations = textTranslations;
            } else {
                processedTextResult[key] = textResult[key];
            }
        }
        return processedTextResult;
    },

    rearrangeJSONResult: function(texts, result, isTranslation) {
        var response = {
            'status': 'Success'
        };
        var rearrangedResponse = [];
        for (var i = 0; i < texts.length; i++) {
            if (isTranslation) {
                var eachTextResult = result[i];
            } else {
                var eachTextResult = result[texts[i]];
            }
            if ('Error' === eachTextResult.status) {
                response['status'] = 'Error';
            }
            var processedTextResult = this._getProcessedTextResult(eachTextResult);
            rearrangedResponse.push(processedTextResult);
        }
        if (isTranslation)
            response['translations'] = rearrangedResponse;
        else
            response['detections'] = rearrangedResponse;
        return response;
    },

    type: 'MicrosoftTranslationBatchingUtil'
};
