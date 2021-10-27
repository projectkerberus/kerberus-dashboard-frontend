export type DateAggregation = {
  date: string; // YYYY-MM-DD
  amount: number;
};

export function aggregationFor(
  intervals: string,
  baseline: number,
): DateAggregation[] {
  const { duration, endDate } = parseIntervals(intervals);
  const inclusiveEndDate = inclusiveEndDateOf(duration, endDate);
  const days = DateTime.fromISO(endDate).diff(
    DateTime.fromISO(inclusiveStartDateOf(duration, inclusiveEndDate)),
    'days',
  );

  function nextDelta(): number {
    const varianceFromBaseline = 0.15;
    // Let's give positive vibes in trendlines - higher change for positive delta with >0.5 value
    const positiveTrendChance = 0.55;
    const normalization = positiveTrendChance - 1;
    return baseline * (Math.random() + normalization) * varianceFromBaseline;
  }

  return [...Array(days).keys()].reduce(
    (values: DateAggregation[], i: number): DateAggregation[] => {
      const last = values.length ? values[values.length - 1].amount : baseline;
      const date = DateTime.fromISO(
        inclusiveStartDateOf(duration, inclusiveEndDate),
      )
        .plus({ days: i })
        .toFormat(DEFAULT_DATE_FORMAT);
      const amount = Math.max(0, last + nextDelta());
      values.push({
        date: date,
        amount: amount,
      });
      return values;
    },
    [],
  );
}

function parseIntervals(intervals: string): IntervalFields {
  const match = intervals.match(
    /\/(?<duration>P\d+[DM])\/(?<date>\d{4}-\d{2}-\d{2})/,
  );
  if (Object.keys(match?.groups || {}).length !== 2) {
    throw new Error(`Invalid intervals: ${intervals}`);
  }
  const { duration, date } = match!.groups!;
  return {
    duration: duration as Duration,
    endDate: date,
  };
}
