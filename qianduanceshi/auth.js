class APIAuth {
    constructor(apiKey) {
        try {
            const [id, secret] = apiKey.split('.');
            this.id = id;
            this.secret = secret;
        } catch (e) {
            throw new Error("Invalid API Key format");
        }
    }

    // 生成JWT Token
    generateToken(expSeconds = 3600) {
        // 使用 jwt-encode 库 (需要通过CDN引入)
        const header = {
            "alg": "HS256",
            "sign_type": "SIGN"
        };

        const now = Date.now();
        const payload = {
            "api_key": this.id,
            "exp": now + expSeconds * 1000,
            "timestamp": now
        };

        return jwt_encode(payload, this.secret, header);
    }
} 