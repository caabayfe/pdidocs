(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here

    var attachmentId = env.getSource();
    var chunked = env.getArguments().chunked;

    var gsa = new GlideSysAttachment();

    var content = [];

    //Get attachment and check if it's below 5 MB
    var grAttachment = new GlideRecord('sys_attachment');
    grAttachment.get(attachmentId);

    if (grAttachment.isValidRecord() && grAttachment.size_bytes <= 5242880) {

        if (chunked) {

            var attachmentDocs = gsa.getAttachmentParts(attachmentId);

            while (attachmentDocs.next()) {

                content.push(attachmentDocs.getValue("data"));
            }

        } else {

            content.push(GlideStringUtil.base64Encode(gsa.getBytes(grAttachment)));

        }

    } else content.push("");

    return content;


})(env);
