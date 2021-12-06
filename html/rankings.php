<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Rankings') .
        css('../css/common.css') .
        css('../css/rankings.css') .
        js('../js/rankings.js')) .
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
