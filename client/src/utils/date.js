import NepaliDate from 'nepali-date-converter';

export const formatADtoBS = (adDateString) => {
  if (!adDateString) return '—';
  const date = new Date(adDateString);
  if (isNaN(date.getTime())) return '—';
  try {
    const npDate = new NepaliDate(date);
    const year = npDate.getYear();
    const month = String(npDate.getMonth()).padStart(2, '0');
    const day = String(npDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '—';
  }
};

export const formatADtoBSLong = (adDateString) => {
  if (!adDateString) return '—';
  const date = new Date(adDateString);
  if (isNaN(date.getTime())) return '—';
  try {
    const npDate = new NepaliDate(date);
    return npDate.format('YYYY MMMM DD');
  } catch {
    return '—';
  }
};

export const convertBStoAD = (bsDateString) => {
  if (!bsDateString) return null;
  try {
    const [year, month, day] = bsDateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    const npDate = new NepaliDate(year, month, day);
    const engDate = npDate.toEnglish();
    return engDate.toISOString().split('T')[0];
  } catch {
    return null;
  }
};