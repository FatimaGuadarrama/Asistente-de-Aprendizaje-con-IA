studyFlow.e2e.test.js
import request from "supertest";
import app from "../../server.js";

describe("Flujo completo de estudio", () => {
  let token;

  it("registro → login", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "leo", email: "leo@mail.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "leo@mail.com", password: "123456" });

    token = res.body.token;

    expect(token).toBeDefined();
  });
});