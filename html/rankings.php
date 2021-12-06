
<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Rankings') .
        stylesheet('../css/common.css') .
        stylesheet('../css/rankings.css') .
        script('../js/rankings.js')) .
    body(
        array(),
        nav() .
        main(
            container(
            logo() .
                card('Rankings',
                    table('table-container',
                          array('Rank', 'Name', 'Score')))))));
 ?>
