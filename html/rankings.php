<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Rankings') .
        css('../css/common.css') .
        css('../css/rankings.css') .
        js('../js/rankings.js')) .
    body(array('onload', 'initRankingsTable();'),
        nav() .
        main(
            container(
            logo() .
                card('Rankings',
                    table('rankings-table',
                          array('Rank', 'Name', 'Score')))))));
 ?>
