import { app, InvocationContext, Timer } from "@azure/functions";

export async function weekly(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
}

app.timer('weekly', {
    schedule: '0 0 5 * * 0',
    handler: weekly
});
