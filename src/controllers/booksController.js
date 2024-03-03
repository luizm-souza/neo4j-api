import { driver } from '../config/dbConnect.js';
import Joi from 'joi';

export class BookController{

    static create = async (req, res) => {
        const schema = Joi.object({
            title: Joi.string().required(),
            year: Joi.number().integer().required(),
            publisher: Joi.string().required(),
            author: Joi.string().required()
        })

        const {error, value} = schema.validate(req.body)

        if(error){
            return res.status(400).json({error: error.details[0].message})
        }

        console.log(value)
        
        try{
            const {title, publisher, year, author} = value

            const result = await driver.executeQuery(
                'MATCH (a:Author {name: $author}) RETURN a',
                { author: author },
                { database: 'neo4j'}
            )
            const nodes = result.records.map(record => record.get('a').properties);

            if(nodes == ""){
                return res.status(400).send("O autor cadastrado não existe!")
            }

            await driver.executeQuery(
                `MATCH (a:Author)
                WHERE a.name = $author
                MERGE (b:Book { title: $title, publisher: $publisher, year: $year })
                CREATE (a)-[:WROTE]->(b)
                RETURN a, b`,
                { title: title, publisher: publisher, year: year, author: author },
                { database: 'neo4j'}
            )
            res.status(201).json("Livro cadastrado com sucesso")
        }catch(error){
            res.status(400).send({message: `${error} - Não foi possível cadastar um livro novo`})
        }
    }

    static delete = async (req, res) => {
        try{
            const id = parseInt(req.params.id)

            await driver.executeQuery(
                `
                MATCH (b:Book)
                WHERE id(b) = $id
                DETACH DELETE b
                `,
                { id: id }
            );
            res.status(200).json("Livro deletado com sucesso")
        }catch(error){
            res.status(400).send({message: `${error} - Não foi possível deletar o livro`})
        }
    }

    static list = async (req, res) => {
        try {
            const result = await driver.executeQuery(
                'MATCH (b:Book) RETURN b'
            )

            const nodes = result.records.map(record => record.get('b').properties);

            res.status(200).json(nodes)
        } catch (error) {
            res.status(400).send({message: `${error} - Não foi possível retornar todos os livros`})
        }
    }

    static update = async (req, res) => {
        const schema = Joi.object({
            title: Joi.string(),
            year: Joi.number().integer(),
            publisher: Joi.string()
        })

        const {error, value} = schema.validate(req.body)

        if(error){
            return res.status(400).json({error: error.details[0].message})
        }

        

        try {
            const id = parseInt(req.params.id)

            const {title, publisher, year} = value

            const session = driver.session();

            const result = await driver.executeQuery(`
                MATCH (b:Book)
                WHERE id(b) = $id
                ${title != undefined ? 'SET b.title = $title' : ''}
                ${publisher != undefined ? 'SET b.publisher = $publisher' : ''}
                ${year != undefined ? 'SET b.year = $year' : ''}
                RETURN b
                `,
                { id, title, publisher, year }
            );

            res.status(200).json(result.records[0].get("b").properties)
        } catch (error) {
            res.status(400).send({message: `${error} - Não foi possível atualizar o livro requerido`})
        }
    }
}