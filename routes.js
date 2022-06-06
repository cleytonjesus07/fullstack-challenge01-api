import Router from "@koa/router";
import { PrismaClient } from "@prisma/client";
import { createToken, decodeToken } from "./jwt.js";
import { comparePassword, encrypt } from "./utils.js";

export const router = new Router();

const prisma = new PrismaClient();

router.post('/signup', async (ctx) => {
    const {name,username,email,password} = ctx.request.body.data;
    try {
        
        const user = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: encrypt(password)
            }
        })
        
        delete user.password;
        user.accessToken = createToken(user);
        ctx.body = user;

    } catch (error) {
        if (error.meta && !error.meta.target) {
            ctx.status = 422;
            ctx.body = error.code;
            return;
        }
       
        ctx.status = 500;
        ctx.body = "Internal error";
    }

})

router.get('/login', async (ctx) => {
    const auth = ctx.request.headers.authorization.split(" ")[1];
    const [email, plainTextPassword] = Buffer.from(auth, 'base64').toString('ascii').split(":");

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })
   
    if (!user) {
        ctx.status = 404;
        return;
    }

    const matchPassword =  comparePassword(plainTextPassword, user.password);
    delete user.password;
    user.accessToken = createToken(user);
    matchPassword ? ctx.body = user : ctx.status = 404;
})

router.get("/tweets", async (ctx) => {
    /* Buscar todos os tweets */
    console.log("Hoje estou zuero.")
    const token = ctx.request.headers?.authorization?.split(" ")[1] || undefined;
    if (typeof token === "undefined") {
        ctx.status = 401;
        return;
    }

    try {
        console.log("JWT")
        const tweets = (decodeToken(token)) && await prisma.tweet.findMany({include:{user:true}});
        const newArr_tweets = tweets.map((tweet)=>{
            delete tweet.user.password
            return tweet;
        });
        ctx.body = newArr_tweets;
    } catch (error) {
        ctx.status = 500;
        return;
    }
})

router.post('/tweets', async (ctx) => {
    /* Salvar um tweet */
    const token = ctx.request.headers?.authorization?.split(" ")[1] || undefined;
    console.log(token);
    if (typeof token === "undefined") {
        ctx.status = 401;
        return;
    }

    try {
        const payload = decodeToken(token);
        ctx.body = await prisma.tweet.create({
            data: {
                userId: payload.sub,
                text: ctx.request.body.text
            }
        })
    } catch (error) {
        ctx.status = 401;
        return;
    }
})

router.delete('/tweets', async (ctx) => {
    /* Deletar um tweet */
    const deletedTweet = await prisma.tweet.delete({
        where: {
            id: ctx.query.id
        }
    })

    ctx.body = { message: "Tweet deletado com sucesso. :D", deletedTweet };
})

