export default () => ({
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    EMAIL: process.env.EMAIL,
    PASS: process.env.PASS,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    BEARER: process.env.BEARER,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME
})