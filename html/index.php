<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Login') .
        stylesheet('../css/common.css') .
        script('../js/common.js') .
        script('../js/accounts.js') .
        script('../js/validation.js') .
        script('../js/login.js')) .
    body (
        nav() .
        main(
            container(
            logo() .
                card('Login',
                    container(
                        sectionTitle('Player 1') .

                        field('email1', 'Email') .
                        field('password1', 'Password', 'password') .

                        space() .

                        sectionTitle('Player 3') .
                        field('email2', 'Email') .
                        field('password2', 'Password', 'password') .

                        error() .
                        containerRight(
                            button('Login', 'handleLogin();'))))))));
 ?>
