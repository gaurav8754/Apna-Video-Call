let IS_PROD = process.env.NODE_ENV === "production";
const server = IS_PROD ?
    "https://apna-video-call-qtur.onrender.com" :
    `http://${window.location.hostname || "localhost"}:8000`;

export default server;