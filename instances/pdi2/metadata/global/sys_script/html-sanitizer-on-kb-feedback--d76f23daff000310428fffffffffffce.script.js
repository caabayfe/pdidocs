(function executeRule(current, previous) {

    if (current.comments.nil()) return;

    var raw = current.comments.toString();

    var sanitized = SNC.GlideHTMLSanitizer.sanitize(raw);

    function isSafeSrc(src) {
        if (!src) return false;
        src = src.trim().toLowerCase();
        if (
            src.indexOf('/sys_attachment.do') === 0 ||
            src.indexOf('/db_image.do') === 0 ||
            src.indexOf('/images/') === 0
        ) return true;
        if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(src))
            return true;
        return false;
    }

    //<img src="..."> — allowlist: strip external, preserve attachments
    sanitized = sanitized.replace(
        /<img\b[^>]*\bsrc\s*=\s*"([^"]*)"[^>]*\/>/gi,
        function(match, src) {
            return isSafeSrc(src) ? match : '';
        }
    );

    // <input type="image"> — not a supported comment feature, strip entirely
    sanitized = sanitized.replace(
        /<input\b[^>]*\btype\s*=\s*"image"[^>]*\/>/gi, ''
    );

    // <video src="..."> — video not a supported attachment type, strip entirely
    sanitized = sanitized.replace(
        /<video\b[^>]*>[\s\S]*?<\/video>|<video\b[^>]*\/>/gi, ''
    );

    // <source src="..."> — only meaningful inside video/audio, strip entirely
    sanitized = sanitized.replace(
        /<source\b[^>]*\/>/gi, ''
    );

    current.comments = sanitized;

})(current, previous);
