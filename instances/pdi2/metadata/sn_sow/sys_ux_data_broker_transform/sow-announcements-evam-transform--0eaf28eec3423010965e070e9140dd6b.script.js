function transform(inputs) {
    var evamData = inputs.evamOutput;
    var config = inputs.configuration;
    return sn_sow.SOWEvamPostProcessor.process(evamData, config);
}
