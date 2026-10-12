        var totalIncidents = 0;
        var totalMilliSecondsSum = 0;
        var gr = new GlideAggregate('incident');
        gr.addEncodedQuery('closed_atONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()^active=false');
        gr.addAggregate('SUM', 'opened_at');
        gr.addAggregate('SUM', 'resolved_at');
        gr.addAggregate('COUNT');
        gr.setGroup(false);
        gr.query();
        while (gr.next()) {
            var aggregateOpenedTime = gr.getAggregate('SUM', 'opened_at');
            var aggregateResolvedTime = gr.getAggregate('SUM', 'resolved_at');
            totalIncidents = gr.getAggregate('COUNT');
        }
        aggregateOpenedTime = new GlideDateTime(aggregateOpenedTime);
        aggregateResolvedTime = new GlideDateTime(aggregateResolvedTime);
        var answer = 0;
        totalMilliSecondsSum = aggregateResolvedTime.getNumericValue() - aggregateOpenedTime.getNumericValue();
        if (totalIncidents > 0) {
            answer = totalMilliSecondsSum / (1000 * 60 * 60 * totalIncidents);
        }
        else {
           answer = 0;
        }
