const db = require('../../src/db')
const { generateRandomKey } = require('../../scripts/genKey')

beforeAll(done => {
    db.clear(done)
})

afterAll(done => {
    db.close(done)
});

describe('Key generation script', ()=> {
    let keyGenerated
    
    it('should generate a random and unique key in the db', (done) => {
        generateRandomKey(key => {
            keyGenerated = key
            expect(key).toHaveLength(12)
            done()
        })
    })

    it('should find the generated key in the database', (done) => {
        db.get(keyGenerated, (error, value) => {
            expect(error).toBeNull()
            expect(value).toEqual('{}')
            done()
        })
    })

    it('should return an error if something fails', (done) => {
        db.put = (key, value, cb) => { 
            cb(new Error('Error when saving to db'))
        }
        
        generateRandomKey(error =>{
            expect(error).toEqual(new Error('Error when saving to db'))
            done()
        })
    })
})
