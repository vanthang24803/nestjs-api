import { Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "./connection";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import * as schema from "@/schema";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow("DATABASE_URL"),
        });
        return drizzle(pool, {
          schema: {
            ...schema,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
