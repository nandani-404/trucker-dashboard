function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match && match[2] ? decodeURIComponent(match[2]) : null;
}

// Automatically fetch CSRF cookie if missing
let csrfPromise: Promise<void> | null = null;
const initCSRF = async () => {
    if (!csrfPromise) {
        csrfPromise = fetch('https://truckmitr.com/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(() => { }).catch(() => { csrfPromise = null; });
    }
    await csrfPromise;
};

export const apiFetch = async (endpoint: string, formData: FormData) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };

    // If we're not local, we try to use stateful requests with Sanctum which requires CSRF
    if (!isLocal) {
        let token = getCookie('XSRF-TOKEN');
        if (!token) {
            await initCSRF();
            token = getCookie('XSRF-TOKEN');
        }
        if (token) {
            headers['X-XSRF-TOKEN'] = token;
        }
    }

    // Include bearer token from cookies if applicable (from the middleware logic you prefer)
    const authToken = getCookie('token');
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`https://truckmitr.com${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: isLocal ? 'omit' : 'include',
        headers
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error(`Server connection error (Status ${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
};