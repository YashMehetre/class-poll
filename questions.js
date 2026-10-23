// The five poll questions live in the repo, not in the database.
// To change one: edit this file, commit, push. With the pipeline in place,
// that push is what updates the live site.
//
// The server stores each answer as the NUMBER of the option (0 = first option),
// so the order of "options" matters: reordering them after people have voted
// would silently change what old answers mean.
module.exports = [
    {
        text: "Which status code should a successful POST that creates something return?",
        options: ["200", "201", "204", "404"],
    },
    {
        text: "Where should the database password live?",
        options: [
            "In server.js",
            "In the README",
            "In .env, which git ignores",
            "In the frontend code",
        ],
    },
    {
        text: "How comfortable are you with Day 4 (git, GitHub, MongoDB)?",
        options: ["Lost", "Shaky", "Okay", "Confident"],
    },
    {
        text: "What should we spend more time on?",
        options: [
            "Git and GitHub",
            "Express and APIs",
            "MongoDB",
            "Frontend",
            "Building with AI",
        ],
    },
    {
        text: "The AI wrote code that gives an error. Your first move?",
        options: [
            "Paste the error back and ask",
            "Read the code myself",
            "Start over with a new prompt",
            "Blame the AI loudly",
        ],
    },
];
