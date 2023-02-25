import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorparationController } from './controllers/corparaion.controller';
import Corparation from './entities/corparation.entity';
import { CorparationService } from './services/corparation.service';

@Module({
  controllers: [CorparationController],
  providers: [CorparationService],
  imports: [TypeOrmModule.forFeature([Corparation])],
  exports: [],
})
export class CorparationModule {}
