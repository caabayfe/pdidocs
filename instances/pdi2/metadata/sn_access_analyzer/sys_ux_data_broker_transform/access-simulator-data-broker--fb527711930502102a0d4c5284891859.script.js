function transform(input) {

    const aaUtil = new sn_access_analyzer.AccessAnalyzerUtil();

    const SimulatorUtil = {

        getAccessResult: (payload) => aaUtil.getDebugLog(payload.request, payload.includeDetails),

        saveSimulatorSetting: aaUtil.saveSimulatorSetting,

        /** 
         * Below method will call "simulateAccess" scriptable API and validate the request.
         * It will provide validation result if any error occurs else it will give debug logs.
         */
        getSimulatedResult: (payload) => aaUtil.getSimulatedResult(payload.request, payload.includeDetails),

        isInheritedRole: aaUtil.isInheritedRole,

        getAccessSimulatorChanges: (payload) => aaUtil.getAccessSimulatorChanges(payload)
    };

    return {
        request: input,
        result: SimulatorUtil[input.action](input.payload)
    };
}
