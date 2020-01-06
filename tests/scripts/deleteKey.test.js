
const db = require('../../src/db')
const { deleteKey } = require('../../scripts/deleteKey')

jest.mock('readline')

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
        deleteKey('nonexistentkey', (result)=>{
            expect(result).toHaveProperty('error')
            expect(result.error).toEqual('not found')
            done()
        })
    })

    it('should return an cancel message if the user press n', (done) =>{
        require('readline').__setResult('n');
        deleteKey('testkey', (result)=>{
        expect(result).toHaveProperty('cancel')
        expect(result.cancel).toBe(true)
        done()
        })
    })

    it('should return a success message if it was deleted', (done) =>{
        require('readline').__setResult('y');
        deleteKey('testkey', (result)=>{
        expect(result).toHaveProperty('success')
        expect(result.success).toBe(true)
        done()
        })
    })

})

