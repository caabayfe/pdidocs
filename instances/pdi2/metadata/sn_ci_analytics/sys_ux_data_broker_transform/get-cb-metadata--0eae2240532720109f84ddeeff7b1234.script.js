function transform(input) {
    var bucket = input.bucket;
    var metadataUtils = new VAConditionBuilderMetadataUtils();
    return {
        dotWalkMetadata: metadataUtils.getStaticDotwalkMetadata(bucket),
        fieldOperatorRelationships: metadataUtils.getFieldOperatorRelationships()
    };
}
