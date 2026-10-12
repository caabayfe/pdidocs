var GAICAttachmentUtils = Class.create();
GAICAttachmentUtils.prototype = {
    initialize: function() {},

    getBase64ContentFromStream: function(attachment_sys_id) {
        var gra = new GlideRecord("sys_attachment");
        if (gra.get(attachment_sys_id)) {
            var StringUtil = new GlideStringUtil();
            var gsa = GlideSysAttachmentInputStream(gra.sys_id.toString());
            var baos = new Packages.java.io.ByteArrayOutputStream();
            gsa.writeTo(baos);
            baos.close();
            return {
                'base64': StringUtil.base64Encode(baos.toByteArray()),
                'format': gra.getValue('content_type').split('/')[1]
            };
        }
    },

    type: 'GAICAttachmentUtils'
};
