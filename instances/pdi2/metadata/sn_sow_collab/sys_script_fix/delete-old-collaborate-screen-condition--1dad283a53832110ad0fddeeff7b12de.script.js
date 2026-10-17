deleteCollaborateTabScreenCondition();

function deleteCollaborateTabScreenCondition() {
    var gr = new GlideRecord('sys_ux_screen_condition');
    if (gr.get('2c73656353d00110b569ddeeff7b1232'))
        gr.deleteRecord();
}
