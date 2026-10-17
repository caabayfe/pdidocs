var RestStepMultipartUtil = Class.create();
RestStepMultipartUtil.prototype = {
    initialize: function() {
        this.parts = [];
    },
    addTextPart: function(name, value, contentType) {
        this.parts.push({
            name: name,
            value: value,
            part_type: 'text',
            content_type: contentType || "application/json",
            order: this.parts.length
        });
    },
    addFilePart: function(name, value, contentType, filename) {
        var setContentType = false;
        var setFilename = false;
        if (contentType && contentType != '') {
            setContentType = true;
        }
        if (filename && filename != '') {
            setFilename = true;
        }
        this.parts.push({
            name: name,
            value: value,
            part_type: 'file',
            content_type: contentType,
            file_name: filename,
            set_file_name: setFilename,
            set_content_type: setContentType
        });
    },
    build: function() {
        return JSON.stringify(this.parts);
    },
    type: 'RestStepMultipartUtil'
};
