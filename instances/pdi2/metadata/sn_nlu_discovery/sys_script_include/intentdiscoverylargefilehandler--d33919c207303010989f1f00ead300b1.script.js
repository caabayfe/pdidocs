var IntentDiscoveryLargeFileHandler = Class.create();
IntentDiscoveryLargeFileHandler.prototype = {
    initialize: function() {},
    isOpening: function(characters) {
        if (characters[0].equals("{")) {
            return true;
        }
        return false;
    },
    isClose: function(characters) {
        if (characters[0].equals("}")) {
            return true;
        }
        return false;
    },
    isValidJson: function(jsonStr) {
        if (jsonStr.substring(0, 1).equals("{") && jsonStr.substring(jsonStr.length - 1).equals("}")) {
            return true;
        }
        return false;
    },
    // Finds the start and end index of an Intent, intents:[{},{},{}]
    // Logic: creates a stack, push when we find {, pop when we find }
    // Assuming the first "{" is the start of the json
    // The string is valid JSON when the stack size goes back to zero
    // If the stack size doesn't go back to zero we need concat the next block of JSON
    getIntentFromJson: function(longString, intentsIndex) {
        gs.debug("starting at index:" + intentsIndex);
        if (longString.length > 50) {
            gs.debug("longString:" + longString.substring(0, 50));
        }
        var stack = [];
        var lastPopIndex = intentsIndex;
        var started = false;
        var startIndex = -1;
        for (var i = intentsIndex + 1; i < longString.length; i++) {
            var nextChar = longString.substring(i - 1, i);
            if (this.isOpening(nextChar)) {
                if (startIndex === -1) {
                    startIndex = i - 1;
                }
                stack.push(i);
                started = true;
            } else if (this.isClose(nextChar)) {
                stack.pop(i);
                lastPopIndex = i + 1;
            }
            if (stack.length === 0 && started == true) {
                gs.debug("breaking at i:" + i);
                break;
            }
        }
        //Stack length reached zero, still in an intent need to concat with next chunk.
        //Added notFound because checking for if startIndex === null returns true for zero
        if (stack.length > 0) {
            return {
                notFound: true
            };
        }
        //Stack length reached zero, still in an intent need to concat with next chunk.
        return {
            start: startIndex,
            end: lastPopIndex,
        };
    },
    //Loop through chunks of JSON and return an array of Intent Objects
    parseJSONChunks: function(jsonChunks) {
        var intents = [];
        var longStr = "";
        for (var i = 0; i < jsonChunks.length; i++) {
            if (i === 0) {
                var intentStartIndex = jsonChunks[i].indexOf("[");
                if (intentStartIndex === -1) {
                    intentStartIndex = 0;
                }
            }
            gs.info("combining next chunk: longStr length: " + longStr.length + "chunk length: " + jsonChunks[i].length);
            longStr = longStr + jsonChunks[i];
            var errorCount = 0;
            while (longStr.length > 1) {
                var indexes = this.getIntentFromJson(longStr, intentStartIndex);
                gs.debug("Got back indexes:" + JSON.stringify(indexes));
                //if we didnt find start and end index then move on to next chunk of json.
                //Added notFound because checking for if indexes.start === null returns true for zero
                if (indexes.notFound === true) {
                    gs.debug("breaking - null:" + longStr.length);
                    break;
                }
                var intentStr = longStr.substring(indexes.start, indexes.end - 1);
                if (this.isValidJson(intentStr)) {
                    intents.push(JSON.parse(intentStr));
                } else {
                    gs.info("invalid json" + JSON.stringify(intentStr));
                    errorCount = errorCount + 1;
                    if (errorCount > 100) {
                        gs.error("JSON parsing Error count > 100, aborting parsing JSON File");
                        return intents;
                    }
                }
                longStr = longStr.substring(indexes.end, longStr.length);
                intentStartIndex = 0;
            }
        }
        return intents;
    },
    // Decode base64 in chunks, concat chunks into a string. 
    // Returns an array of strings, each index is a string of maxSize. 
    // Concat together to make valid json.
    // Attachment is in form of <XML tags ....><objectByteArray>base64 data</objectByteArray>
    decodeLargeBase64Text: function(attachmentSysId) {
        var is = new GlideSysAttachment().getContentStream(attachmentSysId);
        var reader = new GlideTextReader(is);
        var docString = "";
        var startTag = "<objectByteArray>";
        var endTag = "</objectByteArray>";
        var startTagRemoved = false;
        var endTagRemoved = false;
        var maxSize = 16777216;
        var chunkSize = 8192;
        var chunk = "";
        var jsonChunks = [];
        while ((ln = reader.readLine()) != null) {
            // Remove everything before <objectByteArray>
            if (startTagRemoved === false && ln.indexOf(startTag) != -1) {
                ln = ln.substring(ln.indexOf(startTag) + startTag.length, ln.length);
                startTagRemoved = true;
                gs.debug("removed start tag");
            }
            // Remove everything after </objectByteArray>
            if (endTagRemoved === false && ln.indexOf(endTag) != -1) {
                ln = ln.substring(0, ln.indexOf(endTag));
                endTagRemoved = true;
                gs.debug("removed end tag");
            }
            // concat base64 chunk with next line of base64 data
            chunk = chunk + ln;
            // decode base64 at interval based on chunksize
            if (chunk.length >= chunkSize) {
                //decode
                var toDecode = chunk.substring(0, chunkSize);
                var decoded = gs.base64Decode(toDecode);
                chunk = chunk.substring(chunkSize);
                // about to append to decoded ln to json string, if json string would be over limit push
                // then push existing json string to array.
                if (decoded.length + docString.length > maxSize) {
                    jsonChunks.push(docString);
                    docString = "";
                    gs.info("Splitting length is now" + jsonChunks.length);
                }
                // Append decoded line to json string. 
                docString = docString + decoded;
            }
        }
        // Handle the very last chunk of data. 
        // Possible the last chunk < chunkSize (when we append it to the string)
        var lastChunk = gs.base64Decode(chunk);
        if (lastChunk.length + docString.length < maxSize) {
            docString = docString + lastChunk;
            jsonChunks.push(docString);
        } else {
            jsonChunks.push(docString);
            jsonChunks.push(lastChunk);
        }
        for (var i = 0; i < jsonChunks.length; i++) {
            gs.debug("succesfully decoded results file, length:" + jsonChunks[i].length);
        }
        // handle last line
        return jsonChunks;
    },
    //get fields outside of intents
    getNonIntentData: function(jsonChunk) {
        var startIndex = jsonChunk.indexOf("[") + 1;
        var metadataJson = jsonChunk.substring(0, startIndex) + "]}";
        var metadata = JSON.parse(metadataJson);
        return metadata;
    },
    // Reconstruct javascript object returned by JSON.parse() by parsing intent data in chunks.
    // Assumes no intent names contain { or }. 
    handleLargeFile: function(attachmentSysID) {
        var jsonData = this.decodeLargeBase64Text(attachmentSysID);
        if (!jsonData || jsonData.length === 0) {
            gs.error("Unable to decode large file attachment:" + attachmentSysID);
            return null;
        }
        var resultJsonObject = {};
        var metadata = this.getNonIntentData(jsonData[0]);
        gs.debug("got back metadata: " + JSON.stringify(metadata));
        if (!this.isPrimaryReportFile(metadata)) {
            gs.warn("File does not contain primary report keys, aborting decode");
            return null;
        }
        resultJsonObject.totalMessages = metadata.totalMessages || "0";
        resultJsonObject.totalNumIntents = metadata.totalNumIntents || "0";
        resultJsonObject.totalNumClusters = metadata.totalNumClusters || "0";
        var intents = this.parseJSONChunks(jsonData);
        if (!intents || intents.length === 0) {
            gs.error("Unable to parse JSON from decoded text");
            return null;
        }
        resultJsonObject.intents = intents;
        return resultJsonObject;
    },
    isPrimaryReportFile: function(jsonObject) {
        var keys = Object.keys(jsonObject);
        var requiredFields = ["intents", "totalMessages"];
        for (var i = 0; i < requiredFields.length; i++) {
            if (keys.indexOf(requiredFields[i]) === -1) {
                return false;
            }
        }
        return true;
    },
    type: 'IntentDiscoveryLargeFileHandler'
};
