var gr = new GlideAggregate("kb_category");
gr.addQuery("parent_table","kb_category");
gr.query();
var max_height = 0;
while(gr.next()){

var count = 0;
var current = gr;
while(current.parent_id){
   count++;
   current = current.parent_id;
}
if(count>max_height)
   max_height = count;

}
answer = max_height;
