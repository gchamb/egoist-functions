import { app, InvocationContext, Timer } from "@azure/functions";

export async function monthly(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
}

app.timer('monthly', {
    schedule: '0 0 5 1 * *',
    handler: monthly
});
