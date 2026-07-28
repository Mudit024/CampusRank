const nodemailer = require('nodemailer');

// Set up transporter based on env configs
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Sends a registration verification OTP to the user's MNNIT email.
 * Includes a terminal fallback logging block if SMTP configurations fail.
 */
const sendOTPMail = async (email, otp) => {
    const fromAddress = process.env.SMTP_FROM || 'CampusRank <no-reply@campusrank.ac.in>';
    
    const mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'CampusRank Registration OTP Code',
        html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0284c7; margin-bottom: 8px;">CampusRank Verification</h2>
                <p style="color: #475569; font-size: 14px;">Thank you for registering at CampusRank MNNIT Allahabad. Use the following One-Time Password (OTP) to verify your account registration.</p>
                <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0f172a; font-family: monospace;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 11px;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
            </div>
        `
    };

    try {
        const transporter = createTransporter();
        
        // Quick verification check on SMTP server connection
        await transporter.verify();
        
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Verification OTP email successfully sent to: ${email}`);
        return true;
    } catch (error) {
        // Prominent fallback terminal logger if SMTP configurations are invalid/missing
        console.warn('\n⚠️ SMTP transporter failed. Falling back to terminal console logs...');
        console.log('\n==================================================');
        console.log('🔑 CAMPUSRANK DEVELOPMENT OTP DISPATCH');
        console.log(`For Student Email: ${email}`);
        console.log(`Verification Code: ${otp}`);
        console.log('==================================================\n');
        return true; // Return true to prevent blocking local development flows
    }
};

module.exports = {
    sendOTPMail
};
