<?php

/**
 * Renders one documentation PDF and one user manual PDF per student, named to
 * the examination's required pattern.
 *
 * The technical chapters describe a single system built by the group, so they
 * are the same in every copy. Section 17 is not: the examination assesses it
 * individually, so each copy carries a prompt addressed to its author rather
 * than prose written for them. Nobody's contribution is invented here.
 *
 * Run from the project root:
 *
 *   php docs/build-submissions.php
 */
require __DIR__.'/../vendor/autoload.php';

use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\MarkdownConverter;

const GROUP = 'Group07';

$contributions = require __DIR__.'/contributions.php';

/**
 * Builds section 17 for one student: their area, the files it covers, and the
 * questions an examiner is most likely to ask about it.
 */
function contributionSection(array $entry): string
{
    $files = implode("\n", array_map(
        static fn (string $f): string => "- `{$f}`",
        $entry['files']
    ));

    $questions = implode("\n", array_map(
        static fn (string $q): string => "- {$q}",
        $entry['questions']
    ));

    return <<<MARKDOWN
    ## 17. Individual contribution

    **{$entry['name']}**: {$entry['area']}

    {$entry['summary']}

    ### The code this covers

    {$files}

    ### Questions to be ready for

    The examiner may ask about any part of the system, not only this one. These
    are the ones closest to the work described above:

    {$questions}

    > **Before submitting, confirm this describes what you actually did.** This
    > section is assessed individually, and you may be asked to demonstrate any
    > claim in it. Rewrite anything that does not match your own work, and add
    > what is missing, particularly what you found difficult and what you would
    > do differently now.
    MARKDOWN;
}

$documents = [
    'PROJECT-DOCUMENTATION' => [
        'suffix' => 'Capstone_Documentation',
        'subtitle' => 'System design, security and implementation',
    ],
    'USER-GUIDE' => [
        'suffix' => 'User_Manual',
        'subtitle' => 'How to prepare, approve and record payments',
    ],
];

$chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (! is_executable($chrome)) {
    fwrite(STDERR, "Google Chrome not found at {$chrome}\n");
    exit(1);
}

$environment = new Environment([
    'html_input' => 'escape',
    'allow_unsafe_links' => false,
]);
$environment->addExtension(new CommonMarkCoreExtension);
$environment->addExtension(new TableExtension);

$converter = new MarkdownConverter($environment);

// The stylesheet is shared with build-pdf.php so both outputs look identical.
$css = file_get_contents(__DIR__.'/submission.css');

$outputDir = __DIR__.'/submissions';
$contributionsDir = __DIR__.'/contributions';
$workDir = sys_get_temp_dir().'/govpay-submissions';

foreach ([$outputDir, $contributionsDir, $workDir] as $dir) {
    is_dir($dir) || mkdir($dir, 0755, true);
}

/**
 * Renders one PDF from a finished HTML page.
 */
function renderPdf(string $chrome, string $htmlPath, string $pdfPath): bool
{
    exec(sprintf(
        '%s --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=%s %s 2>/dev/null',
        escapeshellarg($chrome),
        escapeshellarg($pdfPath),
        escapeshellarg('file://'.$htmlPath)
    ));

    return is_file($pdfPath);
}

foreach ($contributions as $studentId => $entry) {
    $name = $entry['name'];

    foreach ($documents as $slug => $meta) {
        $markdown = file_get_contents(__DIR__."/{$slug}.md");

        // The first heading becomes the cover; the rest is the body.
        $markdown = preg_replace('/\A# .*?\n/', '', $markdown, 1);

        // Replace the placeholder section 17 with this student's own.
        if ($slug === 'PROJECT-DOCUMENTATION') {
            $replaced = preg_replace(
                '/## 17\. Individual contribution.*?(?=\n---\n\n## 18\.)/s',
                contributionSection($entry)."\n",
                $markdown,
                1
            );

            if ($replaced === null || $replaced === $markdown) {
                fwrite(STDERR, "Could not substitute section 17 for {$name}\n");
                exit(1);
            }

            $markdown = $replaced;
        }

        // The page is rendered from a temp directory, so the relative image
        // paths in the Markdown would resolve to nothing. Point them at the
        // real files before converting.
        $body = str_replace(
            'src="images/',
            'src="file://'.__DIR__.'/images/',
            $converter->convert($markdown)->getContent()
        );
        $safeName = htmlspecialchars($name, ENT_QUOTES);
        $subtitle = $meta['subtitle'];

        $html = <<<HTML
        <!doctype html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <title>GovPay Desk: {$safeName}</title>
        <style>{$css}</style>
        </head>
        <body>
        <div class="cover">
            <p class="org">Adentan Municipal Education Office</p>
            <h1>GovPay Desk</h1>
            <p class="sub">{$subtitle}</p>
            <div class="meta">
                <strong>{$safeName}</strong><br>
                Student ID {$studentId}<br>
                <br>
                CSIT622 Capstone Project &middot; Group 7<br>
                University of Ghana &middot; Department of Computer Science
            </div>
        </div>
        {$body}
        </body>
        </html>
        HTML;

        $htmlPath = "{$workDir}/{$studentId}-{$slug}.html";
        file_put_contents($htmlPath, $html);

        $pdfPath = sprintf('%s/%s_%s_%s.pdf', $outputDir, GROUP, $studentId, $meta['suffix']);
        $ok = renderPdf($chrome, $htmlPath, $pdfPath);

        printf("%s  %s\n", $ok ? 'ok  ' : 'FAIL', basename($pdfPath));
    }

    // A standalone copy of the contribution section, so the division of labour
    // can be reviewed and corrected without opening a 30-page document.
    $contributionHtml = <<<HTML
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Contribution: {$name}</title>
    <style>{$css}</style>
    </head>
    <body>
    <div class="cover">
        <p class="org">Adentan Municipal Education Office</p>
        <h1>GovPay Desk</h1>
        <p class="sub">Individual contribution</p>
        <div class="meta">
            <strong>{$name}</strong><br>
            Student ID {$studentId}<br>
            <br>
            CSIT622 Capstone Project &middot; Group 7<br>
            University of Ghana &middot; Department of Computer Science
        </div>
    </div>
    {$converter->convert(preg_replace('/\A## 17\. Individual contribution\n/', '', contributionSection($entry)))->getContent()}
    </body>
    </html>
    HTML;

    $contributionHtmlPath = "{$workDir}/{$studentId}-contribution.html";
    file_put_contents($contributionHtmlPath, $contributionHtml);

    $contributionPdf = sprintf(
        '%s/%s_%s_Contribution.pdf',
        $contributionsDir,
        GROUP,
        $studentId
    );

    $ok = renderPdf($chrome, $contributionHtmlPath, $contributionPdf);

    printf("%s  %s\n\n", $ok ? 'ok  ' : 'FAIL', basename($contributionPdf));
}

printf(
    "%d submission files in %s\n%d contribution files in %s\n",
    count(glob("{$outputDir}/*.pdf")),
    $outputDir,
    count(glob("{$contributionsDir}/*.pdf")),
    $contributionsDir
);
