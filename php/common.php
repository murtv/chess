<?php
// composable and nestable functions to help avoid code duplication

// the main nav bar (links will never change)
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
    return div('', 'container', $content);
}

function containerRight($content) {
    return div('', 'container-right', $content);
}

function logo() {
    return div('', 'logo', "Chess");
}


function card($title, $content) {
    return div('',
               'card',
               cardTitle($title) . $content);
}

function cardTitle($title) {
    return container(div('', 'card-title', $title));
}

function sectionTitle($title) {
    return  div('', 'section-title', $title);
}

function space() {
    return div('', 'vert-space-24', "");
}

function field($name, $label, $type='text') {
    return div('', 'field-container',
        tag('label', array('class', 'field-label', 'for', $name), $label) .
    "<input class=\"field\" type=\"$type\" id=\"$name\" name=\"$name\" placeholder=\"$label\" />");
}

function error() {
    return div(
        'error', 'error-text', '', array('hidden', 'true'));
}

function table($id, $cols) {
    $headRow = "";

    foreach ($cols as $col) {
        $headRow = $headRow . tag('th', array(), $col);
    }

    return div('', 'table-container',
            tag('table', array('id', $id),
                tag('thead', array(),
                    tag('tr', array(), $headRow)) .
                tag('tbody', array(), "")));
}

function div($id, $class, $content = '', $attrs = array()) {
    return tag('div',
        array_merge(
            array('id', $id, 'class', $class),
            $attrs),
        $content);
}

function main($content) {
    return tag('main', array(), $content);
}

function button($title, $onClick, $attrs = array()) {
    return tag('button',
               array_merge(array(
                   'class', 'button',
                   'onclick', $onClick
               ), $attrs),
               $title);
}

function canvas($id) {
    return tag('canvas', array('id', $id), '');
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

function css($href) {
    return "<link href='$href' rel='stylesheet'>";
}

function js($src) {
    return tag('script', array('src', $src), "");
}

function body($attrs, $content) {
    return tag('body', $attrs, $content);
}

// just outputs a tag, (helps avoid bugs from typos)
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
