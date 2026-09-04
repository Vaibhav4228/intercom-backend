      
export function removeThinkTag(input: string) {
    if (!input) return "";

    return input
        .replace(/<\/?think>/gi, "")  
        .replace(/__TRANSFER_WORKER_AGENT__/gi, "")
        .replace(/^\s*\+\s*/, "")  
        .trim();
}
