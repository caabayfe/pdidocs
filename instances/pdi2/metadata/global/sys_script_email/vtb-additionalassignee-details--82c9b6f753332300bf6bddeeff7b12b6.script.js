(function runMailScript(event, template) {
	var id = event.parm2;
    var gr = new GlideRecord('vtb_card');
    gr.addQuery('task', id);
    gr.addQuery('removed', false);
    gr.query();
    if (gr.getRowCount() == 1) {
        if (gr.next()) {
            var data = 'If you are a member of the board, you can access the card from board ';
            var vtbLink1 = '<a href="/$vtb.do?sysparm_board=' + gr.lane.board.sys_id + '&task=' + gr.task.sys_id + '">' + gr.lane.board.name + '</a><br />';
            template.print(data + vtbLink1);
        }
    } else if (gr.getRowCount() > 1) {
        template.print('You can access the card, if you are a member of at least one of the boards below, <br>');
        while (gr.next()) {
            var vtbLink2 = '<a href="/$vtb.do?sysparm_board=' + gr.lane.board.sys_id + '&task=' + gr.task.sys_id + '">' + gr.lane.board.name + '</a><br />';
            template.print(vtbLink2);
        }
    }
})(event, template);
