<?php
include('../php/common.php');

echo
  html(
    head(
      title('Play') .
      css('../css/common.css') .
      css('../css/game.css') .
      js('https://unpkg.com/sweetalert/dist/sweetalert.min.js') .
      js('../js/game.js')
    ) .
    body(array('onload', 'init();'),
         div('', 'game-container',
             canvas('canvas') .
             div('', 'vert-stack',
                 div('user1-color', 'bold-text') .
                 space() .
                 div('user2-color', 'bold-text') .
                 div('', 'row-stack',
                     button('Resign', 'handleResign();') .
                     button('Draw', 'handleDraw();', array('style', 'margin-left: 12px;'))) .
                 div('', 'bold-text', 'White captured pieces:') .
                 div('white-captured-pieces', 'row-stack', '') .
                 space() .
                 div('', 'bold-text', 'Black captured pieces:') .
                 div('black-captured-pieces', 'row-stack', '')))));
?>
