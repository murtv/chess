<?php

include('../php/common.php');

echo doc(
    "Test Page",
    array(
        array("css", "../css/common.css"),
        array("script", "../js/common.js"),
        array("script", "../js/accounts.js"),
        array("script", "../js/validation.js"),
        array("script", "../js/signup.js")
    ),
    true,
    ""
);
