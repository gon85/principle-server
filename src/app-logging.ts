import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

export const winstonOptions: WinstonModuleOptions = {
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
    }),
    // new winston.transports.File({
    //   format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
    //   filename: 'app.log',
    // }),
  ],
};
