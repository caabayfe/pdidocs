if (current.target_definition.nil()) {
    answer = true;
} else {
    answer = new SNC.PATarget(current.target_definition).canReadTargetDefinition();
}
