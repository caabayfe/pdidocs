function onLoad() {

    var DEFAULT_STOP_WORD_DICTIONARY_SYS_ID = "9865058bc7031010d1cfd9795cc26037";
    var message = "Please do not edit the default stop words. Consider cloning the default stop word dictionary instead.";

    if (g_form.getValue('dictionary') == DEFAULT_STOP_WORD_DICTIONARY_SYS_ID) {
        g_form.addInfoMessage(getMessage(message));
    }
}
