<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Login') .
        css('../css/common.css') .
        js('../js/common.js') .
        js('../js/accounts.js') .
        js('../js/validation.js') .
        js('../js/login.js')) .
    body(array(),
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

                        sectionTitle('Player 2') .
                        field('email2', 'Email') .
                        field('password2', 'Password', 'password') .

                        error() .
                        containerRight(
                            button('Login', 'handleLogin();'))))))));
 ?>
