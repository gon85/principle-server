import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export default class PageInfoDto {
  @ApiProperty({
    description: '페이지',
  })
  @IsNumber()
  page = 1;

  @ApiProperty({
    description: '총 건수',
  })
  totalCount = 0;

  @ApiProperty({
    description: '페이지당 건수',
  })
  countPerPage = 10;

  @ApiProperty({
    description: '표시할 페이지 번호의 갯수',
  })
  countOfDisplayPageNo = 10;

  constructor(page = 1, totalCount = 0, countPerPage = 10, countOfDisplayPageNo = 10) {
    this.page = page;
    this.totalCount = totalCount;
    this.countPerPage = countPerPage;
    this.countOfDisplayPageNo = countOfDisplayPageNo;
  }

  get skip() {
    return (this.page - 1) * this.countPerPage;
  }

  static create(page = 1, totalCount = 0, cntPerPage = 10, cntOfDisplayPageNo = 10) {
    return new PageInfoDto(page, totalCount, cntPerPage, cntOfDisplayPageNo);
  }
  static createAll(cntPerPage = 10000) {
    return new PageInfoDto(1, 0, cntPerPage, 10);
  }
}
