try {
    new MosaicHermesUtils().repairMosaicKafkaSubscription();
} catch (ex) {
    gs.error("Mosaic Kafka post-clone repair failed: " + ex);
}
