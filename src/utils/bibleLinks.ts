import type { Translation } from '../types';

export function getBibleReadingUrl(
  book: string,
  chapter: number,
  translation: Translation
): string {
  const query = encodeURIComponent(`${book} ${chapter}`);
  switch (translation) {
    case 'NASB95':
      return `https://nasb.literalword.com/?q=${query}`;
    case 'LSB':
      return `https://lsb.literalword.com/?q=${query}`;
    case 'ESV':
      return `https://esv.literalword.com/?q=${query}`;
    case 'KJV':
      return `https://www.biblegateway.com/passage/?search=${query}&version=KJV`;
  }
}
