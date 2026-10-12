function transform() {
    var allowOverflow;
    try {
        allowOverflow = gs.getProperty('sn_generative_ai.nowllm_allow_overflow');
    } catch (e) {
        gs.error('Failed to get nowllm_allow_overflow property');
    }
    return allowOverflow === "true";
}
