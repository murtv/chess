
 <?php

function nav() {
    $links = array(
        array("Login", "./index.php"),
        array("Sign Up", "./signup.php"),
        array("Rankings", "./rankings.php")
    );

    $linksString = '';

    foreach ($links as $link) {
        $title = $link[0];
        $href = $link[1];

        $linksString = $linksString . "<a class=\"nav-item\" href=\"$href\"> $title </a>";
    }

    return tag('header', array('class', 'nav'), $linksString);
}

function container($content) {
    return div(array('class', 'container'), $content);
}

function containerRight($content) {
    return div(array('class', 'container-right'), $content);
}

function logo() {
    return div(array('class', 'logo'), "Chess");
}

function card($title, $content) {
    return div(array('class', 'card'),
               cardTitle($title) .
               $content);
}

function cardTitle($title) {
    return container(div(array('class', 'card-title'), $title));
}

function sectionTitle($title) {
    return  div(array('class', 'section-title'), $title);
}

function space() {
    return div(array('class', 'vert-space-24'), "");
}

function field($name, $label, $type='text') {
    return div(array('class', 'field-container'),
        tag('label', array('class', 'field-label', 'for', $name), $label) .
    "<input class=\"field\" type=\"$type\" id=\"$name\" name=\"$name\" placeholder=\"$label\" />");
}

function error() {
    return div(array(
        'id', 'error',
        'class', 'error-text',
        'hidden', 'true'), '');
}

function table($id, $cols) {
    $headRow = "";

    foreach ($cols as $col) {
        $headRow = $headRow . tag('th', array(), $col);
    }

    return div(array('class', 'table-container'),
            tag('table', array('id', $id),
                tag('thead', array(),
                    tag('tr', array(), $headRow)) .
                tag('tbody', array(), "")));
}

function div($extraAttrs, $content) {
    return tag('div', $extraAttrs, $content);
}

function main($content) {
    return tag('main', array(), $content);
}

function button($title, $onClick) {
    return tag('button',
               array(
                   'class', 'button',
                   'onclick', $onClick
               ),
               $title);
}

function html($content) {
    return
        "<!DOCTYPE html>" .
        tag('html', array(), $content);
}

function head($content) {
    return tag('head', array(), $content);
}

function title($content) {
    return tag('title', array(), $content);
}

function stylesheet($href) {
    return "<link href='$href' rel='stylesheet'>";
}

function script($src) {
    return tag('script', array('src', $src), "");
}

function body($attrs, $content) {
    return tag('body', $attrs, $content);
}

function tag($name, $attrs, $content) {
    $attrString = attrs($attrs);
    return "<$name $attrString> $content </$name>";
}

function attrs($attributes) {
    $string = '';

    $attrCount = count($attributes);
    for ($x = 0; $x < $attrCount; $x += 2) {

        $name = $attributes[$x];
        $value = $attributes[$x + 1];

        $string = $string . "$name=\"$value\", ";
    }

    return $string;
}
