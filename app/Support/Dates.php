<?php

namespace App\Support;

use Carbon\CarbonInterface;

/**
 * One date format for the whole system: 16th Feb, 2026.
 *
 * Formatting happens on the server so every screen, printed report and
 * exported record shows the same thing. Left to the browser, the format would
 * follow each viewer's locale and the same voucher would read differently on
 * two desks in the same office.
 */
class Dates
{
    /** 16th Feb, 2026 */
    public static function short(?CarbonInterface $date): ?string
    {
        return $date?->format('jS M, Y');
    }

    /** 16th February, 2026 */
    public static function long(?CarbonInterface $date): ?string
    {
        return $date?->format('jS F, Y');
    }

    /** 16th Feb, 2026 at 14:35 */
    public static function withTime(?CarbonInterface $date): ?string
    {
        return $date?->format('jS M, Y \a\t H:i');
    }

    /**
     * How long ago, for lists where recency matters more than the exact date.
     */
    public static function relative(?CarbonInterface $date): ?string
    {
        return $date?->diffForHumans();
    }
}
