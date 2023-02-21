import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FROMAT = 'HH:mm:ss';

dayjs.extend(utc);

const datetimeUtils = {
  getNowDayjs() {
    return dayjs().clone();
  },
  getTodayDayjs() {
    return datetimeUtils.getDayjs(datetimeUtils.getNowDayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD');
  },
  getNowString(format = DATETIME_FORMAT) {
    return datetimeUtils.getNowDayjs().format(format);
  },
  getDayjs(date?: dayjs.ConfigType, format?: dayjs.OptionType, strict?: boolean) {
    return dayjs(date, format, strict).clone();
  },
  toUtcDate(date: string, format = DATETIME_FORMAT) {
    const djs = datetimeUtils.getDayjs(date, { locale: 'ko', format });
    return djs.toDate();
  },
  dateToUtc(date: Date) {
    return dayjs(date).utc().toDate();
  },
  isHoliday(target: dayjs.Dayjs) {
    const dayOfWeek = target.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }
    return false;
  },

  // getTodayMoment() {
  //   return moment(datetimeUtils.getNowMoment().format('YYYY-MM-DD'), 'YYYY-MM-DD');
  // },
  // getTodayString() {
  //   return datetimeUtils.getNowMoment().format('YYYY-MM-DD');
  // },
  // getMoment(date: moment.MomentInput, format = 'YYYY-MM-DD HH:mm:ss') {
  //   return moment(date, format).clone();
  // },
  // getMomentByDate(date: Date) {
  //   return moment(date).clone();
  // },
  // getFormattedAddDate(interval: number, unit: unitOfTime.Base = 'month') {
  //   return datetimeUtils.getNowMoment().add(interval, unit).format('YYYY-MM-DD HH:mm:ss');
  // },
  // isBeforeNow(date: Date) {
  //   return datetimeUtils.getNowMoment().isBefore(date);
  // },
  // unixtimeToFormatted(timestamp: number | string, format = 'YYYY-MM-DD HH:mm:ss') {
  //   return datetimeUtils.getMoment(timestamp, 'X').format(format);
  // },
};

export default datetimeUtils;
