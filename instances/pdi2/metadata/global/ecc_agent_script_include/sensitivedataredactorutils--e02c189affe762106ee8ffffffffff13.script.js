var Base64 = Packages.java.util.Base64;
var ByteArrayInputStream = Packages.java.io.ByteArrayInputStream;
var ByteArrayOutputStream = Packages.java.io.ByteArrayOutputStream;
var GZIPInputStream = Packages.java.util.zip.GZIPInputStream;
var GZIPOutputStream = Packages.java.util.zip.GZIPOutputStream;
var InputStreamReader = Packages.java.io.InputStreamReader;
var OutputStreamWriter = Packages.java.io.OutputStreamWriter;
var BufferedReader = Packages.java.io.BufferedReader;
var JavaStringBuilder = Packages.java.lang.StringBuilder;
var SensitiveDataRedactor = Packages.com.service_now.mid.probe.util.SensitiveDataRedactor;

var SensitiveDataRedactorUtils = Class.create();

SensitiveDataRedactorUtils.prototype = {

    initialize: function(probe) {
        this.regexes = JSON.parse(probe.getParameter('redaction_regex'));
    },

    redactPatternLog: function(log) {

        var startTime = new Date().getTime();

        var allRegexes = this._collectAllRegexes();

        if (allRegexes.length === 0 || !log)
            return log;

        // Decode the base64-encoded log and remove line breaks
        var base64Log = log.replace(/(\r\n|\n|\r)/gm, "");
        var decodedBytes = Base64.getDecoder().decode(base64Log);

        // Decompress the decoded log into a single string
        var bais = new ByteArrayInputStream(decodedBytes);
        var gis = new GZIPInputStream(bais);
        var reader = new BufferedReader(new InputStreamReader(gis, 'UTF-8'));
        var sb = new JavaStringBuilder();
        var line;

        try {
            while ((line = reader.readLine()) !== null)
                sb.append(line).append('\n');
        } finally {
            reader && reader.close();
        }

        var logPlain = sb.toString();
        var redactedLog;

        try {

            var logData = JSON.parse(logPlain);

            // Helper function to recursively find and redact 'message' fields
            function redactRecursively(data) {
                if (!data)
                    return;

                if (typeof data === 'object') {
                    for (var key in data) {
                        if (key === 'message' && typeof data[key] === 'string')
                            data[key] = String(SensitiveDataRedactor.redact(data[key], allRegexes));
                        else
                            redactRecursively(data[key]);
                    }
                }
            }

            redactRecursively(logData);
            redactedLog = JSON.stringify(logData);

        } catch (e) {
            ms.log('SensitiveDataRedactorUtils: Failed to parse log as JSON. Redacting the entire content. Error: ' + e.message);
            return log;
        }

        // Compress and re-encode the redacted log
        var baos = new ByteArrayOutputStream();
        var gos = new GZIPOutputStream(baos);
        var writer = new OutputStreamWriter(gos, 'UTF-8');
        var encodedLog;

        try {
            writer.write(redactedLog);
        } finally {
            writer && writer.close();
        }

        var compressedBytes = baos.toByteArray();
        encodedLog = Base64.getEncoder().encodeToString(compressedBytes);

        var endTime = new Date().getTime();
        ms.log('SensitiveDataRedactorUtils: Time taken to redact the pattern log: ' + (endTime - startTime) + ' ms');
        return encodedLog;
    },

    redactObject: function(obj) {
        try {
            var startTime = new Date().getTime();
             if (this._isSensitiveDataPresent(obj))
                this._redactJsonRecursively(obj);
            var endTime = new Date().getTime();
            ms.log('SensitiveDataRedactorUtils: Time taken to redact the object: ' + (endTime - startTime) + ' ms');
        } catch (e) {
            ms.log('SensitiveDataRedactorUtils: Failed to redact object. Sensitive data may be exposed. Error: ' + e.message);
        }
    },

    /**
     * Recursively traverses the JSON object to find and check for sensitive data.
     * It collects string values into a chunk and checks the chunk once it reaches a certain size.
     * This is done for performance reasons.
     */
    _isSensitiveDataPresent: function(obj) {

        var allRegexes = this._collectAllRegexes();

        if (allRegexes.length === 0)
            return false;

        var chunkArray = [];
        var chunkLength = 0;
        var hasAll = 'ALL' in this.regexes;
        var specificKeys = {};
        if (!hasAll)
            for (var key in this.regexes)
                specificKeys[key] = true;

        var CHARACTER_LIMIT = 10000;
        var found = false;

        _traverseAndCheck(obj);

        // Final check for any remaining content in the chunk
        if (!found && chunkArray.length > 0) {
            var chunkString = chunkArray.join('\n');
            if (Boolean(SensitiveDataRedactor.isRegexPresent(chunkString, allRegexes)))
                found = true;
        }

        return found;

        function _traverseAndCheck(current) {
            // Stop traversal if sensitive data is found, or if the current item is null or not an object.
            if (found || !current || typeof current !== 'object')
                return;

            for (var prop in current) {
                if (found)
                    return;

                var value = current[prop];
                if (typeof value === 'string') {
                    // Process the string if we are checking all properties ('ALL') or if this property is specifically targeted.
                    if (hasAll || specificKeys[prop]) {
                        if (value) {
                            chunkArray.push(value);
                            chunkLength += value.length + 1; // for newline
                        }

                        // If the chunk size reaches the limit, check it for sensitive data.
                        if (chunkLength >= CHARACTER_LIMIT) {
                            var chunkString = chunkArray.join('\n');
                            if (Boolean(SensitiveDataRedactor.isRegexPresent(chunkString, allRegexes))) {
                                found = true;
                                return;
                            }
                            // Reset for the next chunk
                            chunkArray = [];
                            chunkLength = 0;
                        }
                    }
                } else if (typeof value === 'object') {
                    // If the property is another object, recurse into it.
                    _traverseAndCheck(value);
                }
            }
        }
    },

    _collectAllRegexes: function() {
        var allRegexes = [];
        for (var key in this.regexes)
            allRegexes.push.apply(allRegexes, this.regexes[key]); // this.regexes[key] is an array of regexes
        return allRegexes;
    },

    _redactJsonRecursively: function(obj) {
        if (!obj || typeof obj !== 'object')
            return;

        for (var key in obj) {
            var value = obj[key];
            if (typeof value === 'string') {
                var regexesToApply = [];
                // Use specific regexes if key exists.
                if (this.regexes[key])
                    regexesToApply = this.regexes[key];

                // Fallback to 'ALL' key.
                else if (this.regexes['ALL'])
                    regexesToApply = this.regexes['ALL'];

                if (regexesToApply.length > 0 && value)
                    obj[key] = String(SensitiveDataRedactor.redact(value, regexesToApply));

            } else if (typeof value === 'object') {
                this._redactJsonRecursively(value);
            }
        }
    },

    type: 'SensitiveDataRedactorUtils'
};
