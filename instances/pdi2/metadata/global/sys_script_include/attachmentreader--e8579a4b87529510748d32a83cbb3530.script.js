var AttachmentReader = Class.create();
AttachmentReader.prototype = {
    initialize: function() {
        this.SIZE_BYTES = "size_bytes";
        this.MAX_DEFAULT_GET_BYTES_LIMIT = 5 * 1024 * 1024;
        this.MAX_GET_BYTES_LIMIT_PROP = gs.getProperty("com.glide.attachment.max_get_size") || this.MAX_DEFAULT_GET_BYTES_LIMIT;
    },

    getContent: function(gr) {
        if (gr.getValue(this.SIZE_BYTES) < this.MAX_GET_BYTES_LIMIT_PROP) {
            //reading the content directly if the size is less than the limit
            var sa = new GlideSysAttachment();
            var binData = sa.getBytes(gr);
            var attachment = String(Packages.java.lang.String(binData));
            return attachment;
        }
        return this.getContentByStreaming(gr.sys_id);
    },

    getContentByStreaming: function(sysId) {
        var is = new GlideSysAttachment().getContentStream(sysId);
        var reader = new GlideTextReader(is);
        var str = '';
        var ln;
        while ((ln = reader.readLine()) != null)
            str += ln;
        return str;
    },

    type: 'AttachmentReader'
};
