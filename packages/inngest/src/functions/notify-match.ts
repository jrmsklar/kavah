import { inngest } from "../client";

export const notifyMatch = inngest.createFunction(
  { id: "notify-match", name: "Notify Match via SMS" },
  { event: "match/notify" },
  async ({ event }) => {
    const { matchId } = event.data as { matchId: string };

    // TODO: Fetch match record with both members
    // TODO: Send SMS to member1 via Twilio
    // TODO: Send SMS to member2 via Twilio
    // TODO: Update match status to 'notified'

    return { matchId, status: "notified" };
  }
);
