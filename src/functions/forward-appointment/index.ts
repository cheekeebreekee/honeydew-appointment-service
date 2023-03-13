import { enhancedWebhookHandler, logWarn, publishEvent } from "honeydew-shared";
import { DETAIL_TYPES } from "honeydew-shared/events/detail-types";
import { CalendlyWebhookEvent } from "honeydew-shared/types";

enum CALENDLY_EVENT_TYPES {
  CREATED = "invitee.created",
  CANECLED = "invitee.canceled",
}

export const handler = enhancedWebhookHandler<{ body: string }>(
  async (event) => {
    const parsedEvent: CalendlyWebhookEvent = JSON.parse(event.body);

    switch (parsedEvent.event) {
      case CALENDLY_EVENT_TYPES.CREATED:
        await publishEvent(
          JSON.stringify(parsedEvent),
          DETAIL_TYPES.APPOINTMENT_CREATED
        );
        break;
      case CALENDLY_EVENT_TYPES.CANECLED:
        await publishEvent(
          JSON.stringify(parsedEvent),
          DETAIL_TYPES.APPOINTMENT_CANCELED
        );
        break;
      default:
        logWarn("Unrecognized event spotted", parsedEvent.event);
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(event),
    };
  }
);
