import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { EvaluationCyclesModule } from './evaluation-cycles/evaluation-cycles.module';
import { MagicLinksModule } from './magic-links/magic-links.module';
import { NominationsModule } from './nominations/nominations.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { EvaluationSummariesModule } from './evaluation-summaries/evaluation-summaries.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:[ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: configService.get<string>('DATABASE_SSL', 'true') === 'true',
        extra:
          configService.get<string>('DATABASE_SSL', 'true') === 'true'
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : undefined,
      }),
    }),
    
    UsersModule,
    
    EvaluationCyclesModule,
    
    MagicLinksModule,
    
    NominationsModule,
    
    EvaluationsModule,
    
    QuestionsModule,
    
    AnswersModule,
    
    EvaluationSummariesModule,
    
    AuthModule,

    EmailModule,
  ],
})
export class AppModule {}