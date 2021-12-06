<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Sign Up') .
        stylesheet('../css/common.css') .
        script('../js/common.js') .
        script('../js/accounts.js') .
        script('../js/validation.js') .
        script('../js/signup.js')) .
    body(
        array(),
        nav() .
        main(
            container(
                logo() .
                card('Sign Up',
                    container(
                        field('name', 'Name') .
                        field('email', 'Email') .
                        field('phone', 'Phone') .
                        field('password', 'Password')) .

                        error() .

                        containerRight(
                            button('Sign Up', 'handleSignUp();')))))));
 ?>
