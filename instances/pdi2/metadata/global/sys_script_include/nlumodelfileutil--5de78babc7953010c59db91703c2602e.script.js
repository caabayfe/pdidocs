var NLUModelFileUtil = Class.create();

var sysProps = NLUConstants.SYS_PROPS;
var constants = NLUConstants.FILE_CONSTANTS;

NLUModelFileUtil.checkFileSize = function(fileSize) {
    if (!fileSize) return false;

    var fileSizeMB = parseInt(fileSize) / (1024 * 1024); // size comes in as bytes.
    return fileSizeMB <= NLUModelFileUtil.getMaxFileSize();
};

NLUModelFileUtil.getMaxFileSize = function() {
    var maxSizeMB = parseInt(gs.getProperty(sysProps.ATTACHMENT_MAX_SIZE, 5));
    if (isNaN(maxSizeMB)) return 5;
    return maxSizeMB;
};

NLUModelFileUtil.getFileNameAndExtension = function(fileName, validFileTypes) {
    if (!fileName) return null;

    var extMatch = fileName.match(constants.FILE_EXTENSION_REGEX);

    if (!extMatch) return null;
    if (validFileTypes && validFileTypes.indexOf(extMatch[2]) < 0) return null;

    return [extMatch[1], extMatch[2]];
};

NLUModelFileUtil.prototype = {
    initialize: function() {},
    type: 'NLUModelFileUtil'
};
