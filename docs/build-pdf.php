<?php

/**
 * Renders the project documentation and user guide to PDF.
 *
 * Converts Markdown to a print-styled HTML page, then drives headless Chrome
 * to produce the PDF. Run from the project root:
 *
 *   php docs/build-pdf.php
 */
require __DIR__.'/../vendor/autoload.php';

use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\MarkdownConverter;

$documents = [
    'PROJECT-DOCUMENTATION' => 'GovPay Desk — Project Documentation',
    'USER-GUIDE' => 'GovPay Desk — User Guide',
];

$environment = new Environment([
    'html_input' => 'escape',
    'allow_unsafe_links' => false,
]);
$environment->addExtension(new CommonMarkCoreExtension);
$environment->addExtension(new TableExtension);

$converter = new MarkdownConverter($environment);

$css = <<<'CSS'
@page { size: A4; margin: 18mm 16mm; }

* { box-sizing: border-box; }

body {
    font-family: "Charter", "Georgia", serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #16181d;
    margin: 0;
}

h1, h2, h3, h4 {
    font-family: "Helvetica Neue", Arial, sans-serif;
    line-height: 1.25;
    color: #0b0c0f;
    page-break-after: avoid;
}

h1 { font-size: 21pt; margin: 0 0 4pt; letter-spacing: -0.2pt; }
h2 {
    font-size: 14pt;
    margin: 22pt 0 7pt;
    padding-bottom: 4pt;
    border-bottom: 1.5px solid #16181d;
}
h3 { font-size: 11.5pt; margin: 15pt 0 5pt; }
h4 { font-size: 10.5pt; margin: 12pt 0 4pt; }

p { margin: 0 0 7pt; }

a { color: #16181d; text-decoration: none; }

ul, ol { margin: 0 0 7pt; padding-left: 17pt; }
li { margin-bottom: 2.5pt; }

code {
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 8.8pt;
    background: #f2f3f5;
    padding: 1px 4px;
    border-radius: 3px;
}

pre {
    background: #f7f8fa;
    border: 1px solid #dfe2e7;
    border-left: 3px solid #16181d;
    border-radius: 3px;
    padding: 8pt 10pt;
    overflow-x: auto;
    page-break-inside: avoid;
    margin: 0 0 9pt;
}

pre code { background: none; padding: 0; font-size: 8.5pt; line-height: 1.45; }

table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 11pt;
    font-size: 9.3pt;
    page-break-inside: avoid;
}

th {
    text-align: left;
    background: #f2f3f5;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-weight: 600;
    font-size: 8.8pt;
    padding: 5pt 7pt;
    border-bottom: 1.5px solid #16181d;
}

td {
    padding: 4.5pt 7pt;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: top;
}

blockquote {
    margin: 0 0 9pt;
    padding-left: 11pt;
    border-left: 3px solid #c9ccd2;
    color: #4a4f57;
}

hr { border: 0; border-top: 1px solid #dfe2e7; margin: 16pt 0; }

strong { font-weight: 600; color: #0b0c0f; }

.cover {
    text-align: center;
    padding-top: 72mm;
    page-break-after: always;
}
.cover .org {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    letter-spacing: 2.2pt;
    text-transform: uppercase;
    color: #6b7079;
}
.cover h1 {
    font-size: 27pt;
    margin: 9pt 0 5pt;
    border: 0;
}
.cover .sub {
    font-size: 12pt;
    color: #4a4f57;
    margin-bottom: 34pt;
}
.cover .meta {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    color: #6b7079;
    line-height: 1.9;
}

/* The in-document contents list duplicates the cover; keep it compact. */
h2 + ol { font-size: 9.8pt; }
CSS;

foreach ($documents as $slug => $title) {
    $source = __DIR__."/{$slug}.md";

    if (! is_file($source)) {
        fwrite(STDERR, "Missing {$source}\n");

        continue;
    }

    $markdown = file_get_contents($source);

    // The first heading becomes the cover; the rest is the body.
    $markdown = preg_replace('/\A# .*?\n/', '', $markdown, 1);

    $body = $converter->convert($markdown)->getContent();

    $subtitle = $slug === 'USER-GUIDE'
        ? 'How to prepare, approve and record payments'
        : 'System design, security and implementation';

    $html = <<<HTML
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>{$title}</title>
    <style>{$css}</style>
    </head>
    <body>
    <div class="cover">
        <p class="org">Adentan Municipal Education Office</p>
        <h1>GovPay Desk</h1>
        <p class="sub">{$subtitle}</p>
        <div class="meta">
            CSIT622 Capstone Project<br>
            University of Ghana &middot; Department of Computer Science<br>
            Group 7
        </div>
    </div>
    {$body}
    </body>
    </html>
    HTML;

    $htmlPath = __DIR__."/{$slug}.html";
    file_put_contents($htmlPath, $html);

    echo "Wrote {$htmlPath}\n";
}
