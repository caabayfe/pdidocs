javascript: var answer = ''; if(!current.component.nil()) {var gr = new GlideRecord('sys_aw_ribbon_component');if (gr.get(current.component)) answer = gr.getValue('tag');} answer;
