function getDailySum() {
    // Encoded query to filter records created in the last day with specific definition_id 
    var encodedQuery = 'definition_id=DEFN1008555^sys_created_onONYesterday@javascript:gs.beginningOfYesterday()@javascript:gs.endOfYesterday()';
    // Create a GlideAggregate to sum 'sum' field 
    var ga = new GlideAggregate('gcf_licensing_count');
    ga.addEncodedQuery(encodedQuery);
    ga.addAggregate('SUM', 'sum');
    ga.setGroup(false);
    ga.query();
    var totalCount = 0.0;

    if (ga.next()) {
        totalCount = ga.getAggregate('SUM', 'sum'); // Get the sum of the 'sum' column 
    }
    return totalCount / (1024 * 1024); // Output the sum divided by 1024 * 1024 since count is sent in bytes and we have to report in MB 
}

answer = getDailySum();
