
<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Rankings') .
        stylesheet('../css/common.css') .
        stylesheet('../css/rankings.css') .
        script('../js/rankings.js')) .
    body (
        nav() .
        main(
            container(
            logo() .
                card('Rankings',
                    table(array('Rank', 'Name', 'Score')))))));
 ?>
