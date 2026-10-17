var gr = new GlideRecord('live_message');
if(gr.get(current.message)) {
    if(current.operation() == 'insert')
        gr.like_count = gr.like_count + 1;
    else
        gr.like_count = gr.like_count - 1;
    gr.update();
}
