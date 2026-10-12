var NLUFileUtil = Class.create();

(function() {
    var sysProps = NLUWorkbenchConstants.sysProps;
    var constants = NLUWorkbenchConstants.constants;

    var maxSizeMB = parseInt(gs.getProperty(sysProps.ATTACHMENT_MAX_SIZE, 5));

    NLUFileUtil.getMaxFileSize = function() {
        return maxSizeMB;
    };

    NLUFileUtil.checkFileSize = function(size) {
        if (!size) return false;

        var fileSizeMB = parseInt(size) / (1024 * 1024); // size comes in as bytes.
        return fileSizeMB <= maxSizeMB;
    };

    NLUFileUtil.getFileNameAndExtension = function(fileName, validFileTypes) {
        if (!fileName) return null;

        var extMatch = fileName.match(constants.FILE_EXTENSION_REGEX);

        if (!extMatch) return null;
        if (validFileTypes && validFileTypes.indexOf(extMatch[2]) < 0) return null;

        return [extMatch[1], extMatch[2]];
    };

    NLUFileUtil.antiVirusCheck = function(attachmentId) {
        var responseMap = sn_snap.AntiVirusOnDemandAdvisor.getAvailabilityForDownload(attachmentId);
        return responseMap ? responseMap["availability"] : 'failure';
    };

    NLUFileUtil.uploadFile = function(record, fileName, fileType, fileContents) {
        var dataUrl = fileContents.replace(constants.BASE64_PREFIX_REGEX, '');
        var attachment = new GlideSysAttachment();
        return attachment.writeBase64(record, fileName, fileType, dataUrl);
    };

    NLUFileUtil.prototype = {
        initialize: function() {},
        type: 'NLUFileUtil'
    };
})();
