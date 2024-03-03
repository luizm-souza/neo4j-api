import neo4j from "neo4j-driver"

const URI = process.env.DATABASE_URI
const USER = process.env.DATABASE_USER
const PASSWORD = process.env.DATABASE_PASSWORD
const driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))

export {driver}