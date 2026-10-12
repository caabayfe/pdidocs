updateBoard();
function updateBoard() {
   var board = new GlideRecord('vtb_board');
   board.get(current.board);
   if (!board || !board.isValidRecord())
       return;

   board.setForceUpdate(true);
   board.update();
}
