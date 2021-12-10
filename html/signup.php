<?php
 include('../php/common.php');

 echo
 html(
    head(
        title('Sign Up') .
        css('../css/common.css') .
        js('../js/common.js') .
        js('../js/accounts.js') .
        js('../js/validation.js') .
        js('../js/signup.js')) .
    body(array(),
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
