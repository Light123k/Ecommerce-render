const app = require("./app");
const cloudinary = require("cloudinary")




//UncaughtException like console.log(youtube)
process.on("uncaughtException", (err) => {
    console.log(`error: ${err.message}`)
    console.log('shutting down server')

    process.exit(1)
})


//require("dotenv").config({ path: "backend/config/config.env" });



const connectDatabase = require("./config/database.js")
connectDatabase()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT, () => {


    console.log(`server is working on http://localhost:${process.env.PORT}`)
})


//Unhandled promise rejection



process.on("unhandledRejection", (err) => {
    console.log(`Error :${err.message}`)
    console.log(`shutting down the server due to unhandled promise rejection`)

    server.close(() => {
        process.exit(1)
    })

})