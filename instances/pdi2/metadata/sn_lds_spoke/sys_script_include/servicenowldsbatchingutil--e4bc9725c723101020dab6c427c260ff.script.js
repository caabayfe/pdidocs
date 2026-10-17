var ServiceNowLDSBatchingUtil = Class.create();
ServiceNowLDSBatchingUtil.prototype = {
    initialize: function() {},
    getDetectionLimits: function() {
        return {
            'textLimit': parseInt(gs.getProperty('glide.dynamic.translation.servicenow.detect.array.element.limit', 50000)),
            'charLimit': parseInt(gs.getProperty('glide.dynamic.translation.servicenow.detect.request.limit', 50000)),
            'arrayLimit': parseInt(gs.getProperty('glide.dynamic.translation.servicenow.detect.array.limit', 500))
        };
    },
    classifyBulkTexts: function(texts, charLimit) {
        var count = 0;
        var classifiedData = {};
        classifiedData["smallTexts"] = [];
        classifiedData["largeTexts"] = [];
        classifiedData["isBatchingRequired"] = false;
        for (var i = 0; i < texts.length; i++) {
            if (texts[i].length > charLimit) {
                classifiedData["largeTexts"].push(texts[i]);
            } else {
                classifiedData["smallTexts"].push(texts[i]);
                count = count + texts[i].length;
                if (count > charLimit) {
                    classifiedData["isBatchingRequired"] = true;
                }
            }
        }
        return classifiedData;
    },
    addLargeTextsToArray: function(result, largeTexts) {
        for (var large = 0; large < largeTexts.length; large++) {
            result.push([largeTexts[large]]);
        }
    },
    getBatchTexts: function(texts, limits) {
        var bytesList = [];
        for (var i = 0; i < texts.length; i++) {
            bytesList.push([texts[i].length, texts[i]]);
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
            var tempWeight = 0;
            while (singleSplit.length != limits.arrayLimit &&
                endIdx >= 0 &&
                startIdx <= endIdx &&
                weight >= (tempWeight + bytesList[endIdx][0])) {
                tempWeight += bytesList[endIdx][0];
                singleSplit.push(bytesList[endIdx][1]);
                endIdx -= 1;
                textsProcessed += 1;
            }
            while (singleSplit.length != limits.arrayLimit &&
                startIdx < arrayLength &&
                startIdx <= endIdx &&
                weight >= (tempWeight + bytesList[startIdx][0])) {
                tempWeight += bytesList[startIdx][0];
                singleSplit.push(bytesList[startIdx][1]);
                startIdx += 1;
                textsProcessed += 1;
            }
            splitTexts.push(singleSplit);
        }
        return splitTexts;
    },
    addSmallTextsToArray: function(smallTexts, result, limits) {
        var tempSmallTexts = [],
            charCount = 0;
        for (var i = 0; i < smallTexts.length; i++) {
            tempSmallTexts.push(smallTexts[i]);
            charCount += smallTexts[i].length;
            if (tempSmallTexts.length == limits.arrayLimit) {
                result.push(tempSmallTexts);
                tempSmallTexts = [];
                charCount = 0;
            }
        }
        if (tempSmallTexts.length > 0) {
            result.push(tempSmallTexts);
        }
    },
    splitInputTextsIntoBatches: function(texts, limits) {
        var result = [];
        var classifiedData = this.classifyBulkTexts(texts, limits.textLimit);
        if (classifiedData["isBatchingRequired"]) {
            var splitTexts = this.getBatchTexts(classifiedData.smallTexts, limits);
            result.push.apply(result, splitTexts);
        } else {
            this.addSmallTextsToArray(classifiedData.smallTexts, result, limits);
        }
        this.addLargeTextsToArray(result, classifiedData.largeTexts);
        return result;
    },
    batchBulkDetectTexts: function(texts) {
        return this.splitInputTextsIntoBatches(texts, this.getDetectionLimits());
    },
    rearrangeJSONResult: function(texts, result) {
        var rearrangedResponse = [];
        for (var i = 0; i < texts.length; i++) {
            rearrangedResponse.push(result[texts[i]]);
        }
        return rearrangedResponse;
    },
    type: 'ServiceNowLDSBatchingUtil'
};
