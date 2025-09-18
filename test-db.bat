@echo off
npx ts-node -r tsconfig-paths/register --project tsconfig.json tests/db-models.test.ts