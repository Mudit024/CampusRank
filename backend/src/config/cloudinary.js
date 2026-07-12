const cloudinary = require('cloudinary').v2;

const isMock = () => {
    return (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud' ||
        process.env.CLOUDINARY_CLOUD_NAME.includes('mock')
    );
};

// Configure SDK if credentials are not mock placeholders
if (!isMock()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

/**
 * Uploads a file buffer to Cloudinary, or mocks the response if running locally with default keys.
 * @param {Buffer} fileBuffer - Binary file buffer
 * @param {string} folder - Target folder
 * @param {string} resourceType - Resource type ('image', 'raw', 'video')
 * @returns {Promise<object>} - Upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'campusrank', resourceType = 'raw') => {
    return new Promise((resolve, reject) => {
        if (isMock()) {
            console.log(`☁️ [Mock Cloudinary] Simulating storage upload. Returning local mock URL.`);
            return resolve({
                secure_url: `https://res.cloudinary.com/mock_cloud/raw/upload/v1720000000/campusrank/transcripts/mock_${Date.now()}.pdf`,
                public_id: `mock_public_id_${Date.now()}`
            });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.error("❌ Cloudinary upload stream error: ", error);
                    return reject(error);
                }
                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

module.exports = { uploadToCloudinary };
