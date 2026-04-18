export function humanizeClass(raw: string): string {
	if (!raw) return '';
	const cleaned = raw.replace(/[-_]+/g, ' ').trim().toLowerCase();
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
	['year', 60 * 60 * 24 * 365],
	['month', 60 * 60 * 24 * 30],
	['week', 60 * 60 * 24 * 7],
	['day', 60 * 60 * 24],
	['hour', 60 * 60],
	['minute', 60],
	['second', 1]
];

export function relativeTime(date: Date | number | string): string {
	const then = typeof date === 'object' ? date.getTime() : new Date(date).getTime();
	const diffSec = Math.round((then - Date.now()) / 1000);
	const abs = Math.abs(diffSec);
	if (abs < 30) return 'just now';
	for (const [unit, seconds] of UNITS) {
		if (abs >= seconds) {
			return rtf.format(Math.round(diffSec / seconds), unit);
		}
	}
	return rtf.format(diffSec, 'second');
}

const SHORT_UNITS: Array<[string, string, number]> = [
	['yr', 'yrs', 60 * 60 * 24 * 365],
	['mo', 'mos', 60 * 60 * 24 * 30],
	['wk', 'wks', 60 * 60 * 24 * 7],
	['day', 'days', 60 * 60 * 24],
	['hr', 'hrs', 60 * 60],
	['min', 'mins', 60],
	['sec', 'secs', 1]
];

export function shortRelativeTime(date: Date | number | string): string {
	const then = typeof date === 'object' ? date.getTime() : new Date(date).getTime();
	const diffSec = Math.round((then - Date.now()) / 1000);
	const abs = Math.abs(diffSec);
	if (abs < 30) return 'just now';
	for (const [singular, plural, seconds] of SHORT_UNITS) {
		if (abs >= seconds) {
			const n = Math.round(abs / seconds);
			const label = n === 1 ? singular : plural;
			return diffSec < 0 ? `${n} ${label} ago` : `in ${n} ${label}`;
		}
	}
	return 'just now';
}
