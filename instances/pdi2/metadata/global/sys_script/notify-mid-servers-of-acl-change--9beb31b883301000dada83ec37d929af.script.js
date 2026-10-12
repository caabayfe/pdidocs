notifyMIDServersOfACLChange();

function notifyMIDServersOfACLChange() {
   var gr = new GlideRecord('ecc_queue');
   gr.initialize();
   gr.setValue( 'agent',  'mid.server.*'  );
   gr.setValue( 'source', 'acls_change'   );
   gr.setValue( 'topic',  'SystemCommand' );
   gr.setValue( 'queue',  'output'        );
   gr.setValue( 'state',  'ready'         );
   gr.setValue( 'priority', '0'           );
   gr.insert();
}
