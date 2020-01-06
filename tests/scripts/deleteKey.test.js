
const db = require('../../src/db')
const { deleteKey, handleGet, handleDel } = require('../../scripts/deleteKey')

const fackeRl = ({
    defaultAnswer: 'y',
    question: (text, cb) => cb(fackeRl.defaultAnswer),
    close: () => null
})


beforeAll(done => {
    db.clear(done)
})

afterAll(done => {
    db.close(done)
});

describe('Deletion Key Script', ()=> {
   beforeEach((done)=> {
       db.put('testkey', '{}', done)
   })

   afterEach((done) => {
       db.del('testkey', done)
   })

   it('should return an error if it doesn\'t find the key', (done) =>{
       handleGet('nonexistentkey', (result)=>{
        expect(result).toHaveProperty('error')
        expect(result.error).toEqual('not found')
        done()
       },fackeRl)(null, undefined)
   })

   it('should return an cancel message if the user press n', (done) =>{
        fackeRl.defaultAnswer = 'n'
        handleGet('testkey', (result)=>{
        expect(result).toHaveProperty('cancel')
        expect(result.cancel).toBe(true)
        done()
        },fackeRl)(null, '{}')
    })

    it('should return a success message if it was deleted', (done) =>{
        fackeRl.defaultAnswer = 'y'
        handleGet('testkey', (result)=>{
        expect(result).toHaveProperty('success')
        expect(result.success).toBe(true)
        done()
        },fackeRl)(null, '{}')
    })

    it('should return a error message if it wasnt deleted', (done) =>{
        fackeRl.defaultAnswer = 'y'
        handleDel('testkey', (result)=>{
        expect(result).toHaveProperty('error')
        expect(result.error).toBe('cannot be deleted')
        done()
        },fackeRl)(true)
    })
})

