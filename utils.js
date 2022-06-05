import bcrypt from "bcrypt";

export const encrypt = (plainPassword) => {
    const saltRounds = 10;
    return bcrypt.hashSync(plainPassword, saltRounds)
}

export const comparePassword =  (plainPassword,encryptPassword) => {
     return bcrypt.compareSync(plainPassword,encryptPassword);
} 