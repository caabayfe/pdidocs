var gr = new GlideAggregate('sys_guided_tour_analytics');
gr.addAggregate('COUNT');
gr.groupBy('last_status');
gr.addEncodedQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
gr.query();
var data={}, status, count, total = 0;
while(gr.next()) {
   status = gr.last_status.toString();
   count = parseInt(gr.getAggregate('COUNT'));
   data[status] = count;
   total += count;
}
data['total'] = total;
var computedData = {count: total, data: data };
answer = new JSON().encode(computedData);
