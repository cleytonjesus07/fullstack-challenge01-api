import jwt from "jsonwebtoken";

export const createToken = (user) => {
    return jwt.sign({
        sub:user.id
    },process.env.JWT_SECRET,{expiresIn: '24h'});
}

export const decodeToken = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET);
} 