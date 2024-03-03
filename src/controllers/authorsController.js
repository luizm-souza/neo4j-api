import { driver } from '../config/dbConnect.js';
import Joi from 'joi';

export class AuthorController{

    static create = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            age: Joi.number().integer().required(),
        })

        console.log(schema)

        const {error, value} = schema.validate(req.body)

        if(error){
            return res.status(400).json({error: error.details[0].message,})
        }
        
        try{

            const {name, age} = value

            await driver.executeQuery(
                `MERGE (a:Author { name: $name, age: $age })`,
                { name: name, age: age },
                { database: 'neo4j'}
            )
            res.status(201).json("Autor cadastrado com sucesso")
        }catch(error){
            res.status(400).send({message: `${error} - Não foi possível cadastar um autor novo`})
        }
    }

    static delete = async (req, res) => {
        try{
            const id = parseInt(req.params.id)

            await driver.executeQuery(
                `
                MATCH (a:Author)
                WHERE id(a) = $id
                DETACH DELETE a
                `,
                { id: id }
            );
            res.status(200).json("Autor deletado com sucesso")
        }catch(error){
            res.status(400).send({message: `${error} - Não foi possível deletar o autor`})
        }
    }

    static deleteAuthorAndBooks = async (req, res) => {
        try{
            const id = parseInt(req.params.id)

            await driver.executeQuery(
                `
                MATCH (a:Author)-[:WROTE]->(b:Book)
                WHERE id(a) = $id
                DETACH DELETE a, b
                `,
                { id: id }
            );
            res.status(200).json("Autor deletado com sucesso")
        }catch(error){
            res.status(400).send({message: `${error} - Não foi possível deletar o autor`})
        }
    }

    static findAll = async (req, res) => {
        try {
            const result = await driver.executeQuery(
                'MATCH (a:Author) RETURN a'
            )

            const nodes = result.records.map(record => record.get('a').properties);

            res.status(200).json(nodes)
        } catch (error) {
            res.status(400).send({message: `${error} - Não foi possível retornar todos os autores`})
        }
    }

    static findBooksByAuthorId = async (req, res) => {
        try {
            const id = parseInt(req.params.id)

            const result = await driver.executeQuery(
                `
                MATCH (a:Author)-[:WROTE]->(b:Book)
                WHERE id(a) = $id
                RETURN b
                `,
                { id: id }
            );

            const books = result.records.map(record => record.get('b').properties);
            res.status(200).send(books)
        } catch (error) {
            res.status(400).send({message: `${error} - Não foi possível retornar os livros do autores`})
        }
    }

    static update = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string(),
            age: Joi.number().integer()
        })

        const {error, value} = schema.validate(req.body)

        if(error){
            return res.status(400).json({error: error.details[0].message})
        }

        

        try {
            const id = parseInt(req.params.id)

            const {name, age} = value

            const session = driver.session();

            const result = await driver.executeQuery(`
                MATCH (a:Author)
                WHERE id(a) = $id
                ${name != undefined ? 'SET a.name = $name' : ''}
                ${age != undefined ? 'SET a.age = $age' : ''}
                RETURN a
                `,
                { id, name, age }
            );

            res.status(200).json(result.records[0].get("a").properties)
        } catch (error) {
            res.status(400).send({message: `${error} - Não foi possível atualizar o autor requerido`})
        }
    }
}