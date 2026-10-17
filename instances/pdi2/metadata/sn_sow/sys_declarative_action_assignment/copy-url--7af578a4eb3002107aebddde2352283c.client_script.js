function onClick() {
    var document, window, url;

    document = top.document;
    window = top.window;
    url = top.location.href;

    copyToClipboard(url);

    function copyToClipboard(str) {
        if (document.execCommand) {
            var v = document.createElement('textarea');
            v.innerHTML = str;
            v.className = "sr-only";
            document.body.appendChild(v);
            v.select();
            var result = false;
            try {
                result = document.execCommand('copy');
            } catch (e) {
                if (window.jslog)
                    jslog("Couldn't access clipboard " + e);
            } finally {
                document.body.removeChild(v);
            }
            if (result) {
                getMessage("Copied to clipboard", function(msg) {
                    g_form.addInfoMessage(msg);
                });
                return true;
            }
        }
        getMessage("Failed to copy URL to clipboard", function(msg) {
            g_form.addErrorMessage(msg);
        });
        return false;
    }
}
