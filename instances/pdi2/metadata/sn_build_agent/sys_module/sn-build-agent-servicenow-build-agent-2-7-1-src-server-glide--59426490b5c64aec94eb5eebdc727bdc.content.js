import { newRecord } from './records.ts';
export function insertAssistantMessage(fields) {
    const gr = newRecord('sn_build_agent_message');
    gr.initialize();
    gr.setValue('content', JSON.stringify({
        id: fields.id,
        sender: 'assistant',
        text: fields.text,
        complete: true,
        duration: 0
    }));
    gr.setValue('conversation', fields.conversation);
    gr.setValue('message_id', fields.id);
    const id = gr.insert();
    return id ? String(id) : null;
}
