export const setSessionCookie = (token: string, days: number = 10) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `auth_token=${token};${expires};path=/;SameSite=Strict;Secure`;
};

export const getSessionCookie = (): string | null => {
    const name = "auth_token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
};

export const clearSession = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_wallet');
    localStorage.removeItem('walletconnect');
};
