(function executeRule(current, previous /*null when async*/ ) {

    /*
     * This BR runs only for the Horizontal Discovery probe; other probes will have the probe_parameters set.
     * Since the specific pattern launched in an HD probe isn’t known beforehand,
     * we can’t predefine a probe parameter (discovery_probe_parameter) as we do for other probes.
     * For better performance, we update `discovery_private_properties` and read from it when the ECC Q record
     * is inserted, avoiding direct queries to the `discovery_sensitive_data_filter` table.
     */
    new RedactionPatternCacheUtil().sync();

})(current, previous);
