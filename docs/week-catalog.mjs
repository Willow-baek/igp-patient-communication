// The full and free pages share one content source. This selects display scope.
export function selectPublishedWeeks(weeks, publishedWeekIds) {
  if (!Array.isArray(weeks) || !Array.isArray(publishedWeekIds))
    throw new TypeError('A published week list is required.');
  const available = new Set(weeks.map(week => week.id));
  if (publishedWeekIds.some(id => typeof id !== 'string' || !available.has(id)))
    throw new TypeError('A published week is missing from the content source.');
  const published = new Set(publishedWeekIds);
  return weeks.filter(week => published.has(week.id));
}
