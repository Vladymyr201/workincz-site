Для настройки GitHub Actions выполните следующие шаги:

1. Перейдите в настройки репозитория на GitHub
   Settings → Secrets and variables → Actions

2. Добавьте следующие секреты:
   Для workflow firestore-backup.yml:
   - GCP_PROJECT_ID
   - GCP_SA_KEY
   - GCP_SA_EMAIL
   - GCS_BUCKET
   - SLACK_WEBHOOK_URL
   - BACKUP_ENCRYPTION_KEY

   Для workflow firebase-deploy.yml:
   - FIREBASE_TOKEN
   - FIREBASE_PROJECT_ID

   Для workflow ci-cd-pipeline.yml:
   - FIREBASE_TOKEN
   - GCP_SA_KEY

3. Проверьте права доступа сервисного аккаунта Google Cloud:
   - Для Firestore Backup: roles/datastore.importExportAdmin и roles/storage.objectAdmin
   - Для Firebase Deploy: roles/firebasehosting.admin

4. Настройте Firebase CLI токен:
   firebase login:ci

5. Проверьте GitHub Actions workflows вручную через вкладку Actions