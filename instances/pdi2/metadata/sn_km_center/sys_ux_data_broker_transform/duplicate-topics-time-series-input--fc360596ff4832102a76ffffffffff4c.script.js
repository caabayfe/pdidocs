function transform(input) {
    const duplicateActionSkill = '4a1774b0472f52102a4a017a516d43ce';

    const jobRuns = [];
    const jobsGr = new GlideRecord('sn_gaf_job_tracker');
    jobsGr.addQuery('offline_job.action_skill', duplicateActionSkill);
    jobsGr.addQuery('progress', 100);
    jobsGr.orderByDesc('sys_created_on');
    jobsGr.setLimit(10);
    jobsGr.query();

    while (jobsGr.next()) {
        const dupGa = new GlideAggregate("kb_duplicate_articles");
        dupGa.addQuery('action_strategy.solution', 'IN', jobsGr.getValue('ml_solutions'));
        dupGa.groupBy("description");
        dupGa.query();

        const createdOn = new GlideDateTime(jobsGr.sys_created_on).getNumericValue();
        const rowCount = dupGa.getRowCount() || 0;
        jobRuns.push({
            timestamp: createdOn,
            value: rowCount
        });
    }

    // Sort jobs in ascending order for topics single score component
    jobRuns.sort(function(a, b) {
        return a.timestamp - b.timestamp;
    });

    return jobRuns;
}
