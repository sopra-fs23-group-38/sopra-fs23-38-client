import {useEffect, useState} from "react";
import Cookies from 'js-cookie'
import {useHistory} from "react-router-dom";
export default function useAuth() {
    const [authenticated, setAuthenticated] = useState(false);
    const router = useHistory();

    useEffect(() => {
        // Check if token is stored in cookie or local storage
        const token = Cookies.get('token');

        if (!token) {
            // User is not authenticated, redirect to login page
            router.push('/login');
        } else {
            setAuthenticated(true)
        }
    }, []);

    return authenticated;
}
