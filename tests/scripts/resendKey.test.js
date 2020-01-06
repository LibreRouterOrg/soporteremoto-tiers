const db = require("../../src/db");
const { resendKey } = require("../../scripts/resendKey");
const nock = require("nock");

jest.mock("readline");

beforeAll(done => {
    db.clear(done);
});

afterAll(done => {
    db.close(done);
});

const exampleConfig = JSON.stringify({
    device: {
        name: "device-orange",
        pubKey:
            "\n" +
            "-----BEGIN RSA PUBLIC KEY-----\n" +
            "-----END RSA PUBLIC KEY-----\n"
    },
    communityName: "FreeNetwork",
    network: {
        secretHash: "00000",
        secretInvite: "00000",
        communityKeys: { id: "@00000.ed25519" }
    }
})

describe("Resend Key Script", () => {
    beforeEach(done => {
        db.put(
            "testkey",
            exampleConfig,
            done
        );
    });

    afterEach(done => {
        db.del("testkey", done);
    });

    it("should return an error if it doesn't find the key", done => {
        resendKey("nonexistentkey", result => {
            expect(result).toHaveProperty("error");
            expect(result.error).toEqual("not found");
            done();
        });
    });

    it("should return an cancel message if the user press n", done => {
        require("readline").__setResult("n");
        resendKey("testkey", result => {
            expect(result).toBeUndefined();
            done();
        });
    });

    it("should return a success message if it was resended", done => {
        nock("http://localhost:3000")
            .post("/send-key")
            .reply(200, { ok: true });
        require("readline").__setResult("y");
        resendKey("testkey", result => {
            expect(result).toHaveProperty("success");
            expect(result.success).toEqual("testkey configuration successfully resent");
            done();
        });
    });

    it("should return a error message if something goes wrong", done => {
        nock("http://localhost:3000")
            .post("/send-key")
            .reply(200, {error: 'missing arguments'});
        require("readline").__setResult("y");
        resendKey("testkey", result => {
            expect(result.error).toEqual("Bot error - missing arguments");
            done();
        });
    });
});
