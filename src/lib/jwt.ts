import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateToken = (payload: object, expiresIn: string | number = '1h'): string => {
    return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): object  => {
    try {
        return jwt.verify(token, secret) as object;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
