<?php

function doc($title, $links, $includeHeader, $content) {
    $linksString = '';

    foreach ($links as $link) {
        if ($link[0] == 'css') {
            $linksString = $linksString . "<link href=\" $link[1] \" rel=\"stylesheet\">";
        } elseif ($link[0] == 'script') {
            $linksString = $linksString . "<script src=\" $link[1] \"></script>";
        }
    }

    $header = "";
    if ($includeHeader) {
        $header = nav(array(
            array("Login", "./index.html"),
            array("Sign Up", "./signup.html"),
            array("Rankings", "./rankings.html")
        ));
    }

    return "
<!DOCTYPE html>

<html>
    <head>
        <title> $title </title>
        $linksString
    </head>

    <body>
        $header
        <main> $content </main>
    </body>
</html>
";
}

function nav($links) {
    $linksString = '';

    foreach ($links as $link) {
        $title = $link[0];
        $href = $link[1];

        $linksString = $linksString . "<a class=\"nav-item\" href=\"$href\"> $title </a>";
    }

    return "
        <header class=\"nav\"> $linksString </header>
";
}

function page($title, $links, $content) {

}

function attrs($attributes) {
    $string = '';

    foreach ($attributes as $attribute) {
        $name = $attribute[0];
        $value = $attribute[1];

        $string = $string . "$name = \" $value \" ";
    }

    return $string;
}
