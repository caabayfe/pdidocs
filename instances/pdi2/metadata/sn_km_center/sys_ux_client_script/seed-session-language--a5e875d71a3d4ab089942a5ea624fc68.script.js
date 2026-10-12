/**
 * Fires when the Get Session Language TRANSFORM completes (DATA_FETCH_SUCCEEDED).
 * Seeds sessionLanguage state from the broker output so ECE can localize TinyMCE's UI.
 */
function handler({ api, event }) {
    var brokerData = api.data && api.data.get_session_language_1;
    var language = brokerData && brokerData.output && brokerData.output.language;
    if (language) {
        api.setState('sessionLanguage', language);
    }
}
