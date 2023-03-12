import { enhancedWebhookHandler, publishEvent } from "honeydew-shared";
import { DETAIL_TYPES } from "honeydew-shared/events/detail-types";
import { CalendlyWebhookEvent } from "honeydew-shared/types";

export const handler = enhancedWebhookHandler<{ body: string }>(
  async (event) => {
    const parsedEvent: CalendlyWebhookEvent = JSON.parse(event.body);

    await publishEvent(
      JSON.stringify(parsedEvent),
      DETAIL_TYPES.APPOINTMENT_CREATED
    );

    return {
      statusCode: 200,
      body: JSON.stringify(event),
    };
  }
);
