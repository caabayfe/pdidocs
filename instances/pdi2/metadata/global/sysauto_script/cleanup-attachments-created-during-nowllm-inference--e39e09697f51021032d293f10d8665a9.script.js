deleteAttachments();

function deleteAttachments() {
    var gr = new GlideRecord("sys_attachment");
    gr.addQuery("file_name", "temp.bin");
    gr.addQuery("content_type", "application/octet-stream");
    gr.addQuery("table_name", "invisible.sys_attachment");
    gr.addEncodedQuery("sys_updated_on<javascript:gs.hoursAgo(24)");
    gr.query();
    while (gr.next()) {
        var gsa = new GlideSysAttachment();
        gsa.deleteAttachment(gr.getUniqueValue());
    }
}
