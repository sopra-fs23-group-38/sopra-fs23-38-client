import axios from "axios";
import Cookies from "js-cookie";


export const requests = axios.create({
    baseURL: "http://localhost:8080",//"https://sopra-fs23-group-38-server.oa.r.appspot.com/",
    withCredentials: true,
});

requests.interceptors.request.use(
    (config) => {
        config.headers["content-type"] = "multipart/form-data";
        config.headers["Access-Control-Allow-Origin"] = "*";
        config.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
        config.headers['token'] = Cookies.get('token')
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);

requests.interceptors.response.use(
    (response) => {
        const result = response.data;

        if (response.status === 401) {
            return Promise.reject(new Error(result.msg || "Your login has expired!"));
        }

        return result;
    },
    (error) => {
        console.log("error" + error);
        return Promise.reject(error);
    }
);

export default requests;
