class Apifeatures {
    constructor(query, querystr) {
        this.query = query
        this.querystr = querystr
    }


    search() {
        const keyword = this.querystr.keyword ? {
            name: {
                $regex: this.querystr.keyword,
                $options: "i"
            }
        } : {}

        this.query = this.query.find({ ...keyword })
        return this
    }


    filter() {
        const querycopy = { ...this.querystr }
        console.log(querycopy)
        const removefields = ["keyword", "page", "limit"]

        removefields.forEach(key => delete querycopy[key])
        console.log(querycopy)
        //this.query = this.query.find(querycopy)

        //Filter for price and rating


        let queryStr = JSON.stringify(querycopy)
        console.log(queryStr)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)
        console.log(queryStr)
        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }

    pagination(resultperpage) {
        const currentpage = this.querystr.page || 1

        const skip = resultperpage * (currentpage - 1)

        this.query = this.query.limit(resultperpage).skip(skip)
        return this
    }
}

module.exports = Apifeatures