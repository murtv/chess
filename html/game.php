<?php
include('../php/common.php');

html(head() . body(array('onload', 'init();')))
?>

<!DOCTYPE html>
<html>

  <head>
    <title>Play</title>

    <link href="../css/common.css" rel="stylesheet">
    <link href="../css/game.css" rel="stylesheet">

    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src='../js/game.js'></script>
  </head>

  <body onload="init();">
    <div class="game-container">
      <canvas id='canvas'></canvas>

      <div class="vert-stack">
	      <div id='user1-color'></div>

	      <div class="vert-space-24"></div>

	      <div id='user2-color'></div>

	      <div class="vert-space-24"></div>

	      <button class="button" onclick="handleResign();">Resign</button>
	      <button class="button" onclick="handleDraw();">Draw</button>
      </div>
    </div>
  </body>

</html>
