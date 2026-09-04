

function randomTask() {
    const titles = [
        "Write blog post",
        "Build gRPC system",
        "Learn Docker",
        "Deploy microservices",
        "Fix bugs",
        "Study system design",
        "Read architecture docs",
        "Improve backend API",
        "Optimize database",
        "Refactor services"
    ];

    return {
        id: crypto.randomUUID(),
        title: titles[Math.floor(Math.random() * titles.length)],
        completed: Math.random() > 0.5
    };
}

export async function GetTasks(call: any, callback: any) {
    try {
        const generatedTasks = Array.from({ length: 5 }, randomTask);

        callback(null, {
            tasks: generatedTasks,
        });

    } catch (err) {
        callback(err, null);
    }
}

