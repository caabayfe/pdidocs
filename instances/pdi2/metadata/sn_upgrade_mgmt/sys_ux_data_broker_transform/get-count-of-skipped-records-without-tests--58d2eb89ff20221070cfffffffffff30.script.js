function transform(input) {
    const records = input.metadataSysIds;
    let count = 0,
        gr;
    for (let key = 0; key < records.length; key++) {
        if (records[key]?.sys_id?.value) {
            gr = new sn_atf.AutomatedTestingFramework.tracedMetadataForMetadata(records[key].sys_id.value);
            if (!gr.hasNext()) {
                count++;
            }
        }
    }
    return count;
}
