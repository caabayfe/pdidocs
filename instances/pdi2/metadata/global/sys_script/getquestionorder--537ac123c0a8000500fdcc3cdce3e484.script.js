getQuestionOrder();
function getQuestionOrder() {
  if (current.question == '')
     return;

  if (!current.isNewRecord())
     return;

  var max = new GlideAggregate('question_choice');
  max.addAggregate('MAX', 'order');
  max.addQuery('question', current.question);
  max.setGroup(false);
  max.query();
  var answer = 0;
  if (max.next()) 
     answer = max.getAggregate('MAX', 'order');

  current.order = (parseInt(answer) + 100);
}
