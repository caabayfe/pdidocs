function transform(input) {
    try {
        var util = new sn_generative_ai.ServiceNowAzureRequestUtil();
        util?.setNowLLMAllowOverflow(input?.overflowValue);
        var allowOverflow = gs.getProperty('sn_generative_ai.nowllm_allow_overflow');
        return allowOverflow;
    } catch (e) {
        gs.error('Failed to update nowllm_allow_overflow property');
        return 'error';
    }
}
