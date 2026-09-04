
export function getNextNode(fullContent:string){

    if (fullContent.includes("__TRANSFER_WORKER_AGENT__")) {
        return {
            nextNode: "workerAgent",
            shouldHandoff: true
        }
    } 
    
    else {
        return {
            nextNode: "",
            shouldHandoff: false
        }
    }

}