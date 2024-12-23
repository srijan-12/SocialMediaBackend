import crypto from 'crypto'
export function generateOTP(num) {
    if (!Number.isInteger(num) || num <= 0) {
        throw new Error("The number of digits must be a positive integer");
    }

    const otp = crypto
        .randomInt(0, Math.pow(10, num))
        .toString()
        .padStart(num, '0');

    return otp;
}