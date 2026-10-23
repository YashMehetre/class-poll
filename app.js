// The Express app, built but not started. server.js connects to the database and
// starts listening; keeping them apart lets a test load this file without a port.
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const questions = require("./questions");

const app = express();
app.use(express.json());

// One submission = one document holding all five answers. We INSERT, never update a
// shared counter, so 40 phones submitting at once cannot overwrite each other.
// Counts are worked out when /results is read.
const responseSchema = new mongoose.Schema({ answers: [Number] }, { timestamps: true });
const Response = mongoose.model("Response", responseSchema);

// The server never trusts the browser: exactly one answer per question, and each
// must be a real option number. Anything else is a 400.
function validAnswers(answers) {
    return (
        Array.isArray(answers) &&
        answers.length === questions.length &&
        answers.every(
            (a, i) => Number.isInteger(a) && a >= 0 && a < questions[i].options.length
        )
    );
}

app.get("/api/health", (req, res) => {
    // readyState 1 = connected. A deploy check can call this to see the whole chain work.
    if (mongoose.connection.readyState === 1) return res.json({ status: "ready" });
    res.status(503).json({ status: "database-unreachable" });
});

app.get("/api/questions", (req, res) => res.json(questions));

app.post("/api/responses", async (req, res) => {
    if (!validAnswers(req.body && req.body.answers)) {
        return res.status(400).json({ error: "Send exactly one valid answer per question" });
    }
    try {
        await Response.create({ answers: req.body.answers });
        res.status(201).json({ ok: true });
    } catch (e) {
        // The browser gets a plain message; the real reason goes to the server log.
        console.error("Could not save a response:", e.message);
        res.status(500).json({ error: "Could not save your answers" });
    }
});

// Only you may read the results. The key comes from .env; if it is not set, the
// route stays closed rather than falling open.
// CLASSROOM SHORTCUT: over plain HTTP the key travels unencrypted. HTTPS fixes that.
function requireAdmin(req, res, next) {
    const key = process.env.ADMIN_KEY;
    if (!key) return res.status(503).json({ error: "ADMIN_KEY is not set on the server" });
    if (req.get("x-admin-key") !== key) return res.status(401).json({ error: "Wrong key" });
    next();
}

app.get("/api/results", requireAdmin, async (req, res) => {
    try {
        // Unwind each response into one row per answer (q = question number), then
        // count how many times each option was chosen for each question.
        const rows = await Response.aggregate([
            { $unwind: { path: "$answers", includeArrayIndex: "q" } },
            { $group: { _id: { q: "$q", a: "$answers" }, n: { $sum: 1 } } },
        ]);
        const total = await Response.countDocuments();
        const result = questions.map((question) => ({
            text: question.text,
            options: question.options.map((text) => ({ text, count: 0 })),
        }));
        for (const row of rows) {
            const option = result[Number(row._id.q)]?.options[row._id.a];
            if (option) option.count = row.n;
        }
        res.json({ total, questions: result });
    } catch (e) {
        console.error("Could not read results:", e.message);
        res.status(500).json({ error: "Could not read results" });
    }
});

// Serves public/index.html at "/" and public/results.html at "/results".
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// A malformed JSON body should answer 400 as JSON, not an HTML error page.
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Bad JSON" });
    next(err);
});

module.exports = app;
