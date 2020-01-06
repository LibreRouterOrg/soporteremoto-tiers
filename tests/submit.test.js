require("dotenv").config();
const request = require("supertest");
const { app, handlePut } = require("../src/app");
const db = require("../src/db");
const nock = require("nock");

afterAll(done => {
  db.close(done);
});

describe("Submit Endpoints Errors", () => {
  beforeEach(done => {
    db.clear(done);
  });

  it("should return an error if api key is missing", async () => {
    const res = await request(app)
      .post("/submit")
      .send({});
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toEqual("missing api key");
  });

  it("should return an error if api key not exist in the db", async () => {
    const res = await request(app)
      .post("/submit")
      .send({ apiKey: "notExistInDb" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toEqual("wrong api key");
  });

  it("should return an error if api key exist but its content is corrupt", async () => {
    db.put("testkey", "no-json-data");

    const res = await request(app)
      .post("/submit")
      .send({ apiKey: "testkey" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toEqual("The configuration could not be saved");
  });

  it("should return an error if api key exist but its alreadyu used", done => {
    const data = { id: "some-random-id" };

    db.put("testkey", JSON.stringify(data), async error => {
      const res = await request(app)
        .post("/submit")
        .send({ apiKey: "testkey" });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toEqual("Api key is already used");
      done();
    });
  });

  it("should return an error if fails to save to the db", done => {
    const req = {
      body: {
        apiKey: "testkey"
      }
    };
    const res = {
      json: body => {
        expect(body).toHaveProperty("error");
        expect(body.error).toEqual("The configuration could not be saved");
        done();
      }
    };
    let handle = handlePut(req, res);
    handle(new Error("error saving key"));
  });
});

describe("Submit Endpoints Success", () => {
  beforeEach(done => {
    db.clear(() => {
      db.put("testkey", "{}", done);
    });
  });

  it("Save the data in the db", async done => {
    nock("http://localhost:3000")
      .post("/send-key")
      .reply(200, { ok: true });

    const data = {
      apiKey: "testkey",
      config: {
        id: "some-id",
        communityName: "some-community-name",
        device: {
          name: "test_device",
          pubKey: "tinc-public-key-to-use-in-librenet6"
        }
      }
    };

    const res = await request(app)
      .post("/submit")
      .send(data);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual(200);
    expect(res.body.librenet6).toEqual({ ok: true });
    done();
  });
});

describe("LibreNet6 bot fails to send pull-request", () => {
  beforeEach(done => {
    db.clear(() => {
      db.put("testkey", "{}", done);
    });
  });
  it("Save the data in the db", async done => {
    nock("http://localhost:3000")
      .post("/send-key")
      .reply(404);

    const data = {
      apiKey: "testkey",
      config: {
        id: "some-id",
        communityName: "some-community-name",
        device: {
          name: "test_device",
          pubKey: "tinc-public-key-to-use-in-librenet6"
        }
      }
    };

    const res = await request(app)
      .post("/submit")
      .send(data);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual(200);
    expect(res.body.librenet6).toHaveProperty("error");
    done();
  });
});
