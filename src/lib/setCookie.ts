import { Response } from 'express';

export const setCookie= (res: Response, token: string) => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 2,
    });
}
